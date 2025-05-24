import {
  OpenAIClient,
  AzureKeyCredential,
  type GetChatCompletionsOptions,
  type ChatRequestMessageUnion,
} from '@azure/openai';

import {
  Pinecone,
  QueryOptions,
  RecordMetadata,
  ScoredPineconeRecord,
} from '@pinecone-database/pinecone';
import GPT3Tokenizer from 'gpt3-tokenizer';

const config = {
  indexName: 'handbook-index',
  namespace: 'handbook-namespace',
  embeddingModel: 'text-embedding-ada-002',
  queryModel: 'gpt-35-turbo',
};

export async function queryOpenai(query: string): Promise<string[]> {
  const openai = await createOpenAIClient();

  const embeddingResponse = await openai.getEmbeddings(config.embeddingModel, [query]);

  if (!embeddingResponse.data) {
    throw new Error(JSON.stringify(embeddingResponse.data));
  }

  const [{ embedding }] = embeddingResponse.data;

  const scoredHandbookItems = await queryHandbookIndex(embedding);

  const uniqueMetadatas = uniqueMetadataByFullContent(
    scoredHandbookItems.map((s) => s.metadata),
  );

  const contextTexts = getContextTexts(uniqueMetadatas);

  const messages: ChatRequestMessageUnion[] = [
    {
      role: 'system',
      content:
        "Du er en intelligent assistent som skal hjelpe brukere med å finne informasjon i Variant-håndboken. All informasjon du trenger er sendt i meldingene nedenfor hvor utdrag fra håndboken er innenfor <handbook>-tags. Du må bare bruke denne informasjonen til å svare på brukerens spørsmål, som er innenfor <question>-tags. Hvis spørsmålet ikke er relatert til noe fra håndboken, skal du ikke prøve å svare på det, men si 'Beklager, jeg vet ikke hvordan jeg kan hjelpe med det'. Brukeren kan stille spørsmål på norsk eller engelsk, svar på samme språk. Veldig viktig: Hvis du ikke finner svaret i meldingene nedenfor, og er usikker, så må du ikke prøve å svare på spørsmålet, men heller si 'Beklager, jeg vet ikke hvordan jeg kan hjelpe med det'",
    },
    {
      role: 'user',
      content: `<handbook>Våre grunnverdier - Verdiene våre ligger til grunn for hvordan vi behandler hverandre. Og disse verdiene er: Åpenhet, læreglede og raushet.</handbook> <question>Hva er Variants grunnverdier?</question>`,
    },
    {
      role: 'assistant',
      content: 'Variants grunnverdier er åpenhet, læreglede og raushet.',
    },
    {
      role: 'user',
      content: `${contextTexts.join('\n')} <question>${query}</question>`,
    },
  ];

  const completionOptions: GetChatCompletionsOptions = {
    maxTokens: 512,
    temperature: 0,
  };

  const res = await openai.getChatCompletions(config.queryModel, messages, completionOptions);
  const { choices } = res;
  return choices.map((c) => c.message?.content).filter(Boolean) as string[];
}

function getContextTexts(metadataArr: HandbookItemMetadata[]): string[] {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;

  let contextTexts: string[] = [];
  for (let { title, fullContent } of metadataArr) {
    const text = title + ' - ' + fullContent.replace(/\n/g, ' ');
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    contextTexts.push(`<handbook>${text}</handbook>`);
  }
  return contextTexts;
}

async function createOpenAIClient() {
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  if (!apiKey)
    throw new Error('Please set the AZURE_OPENAI_API_KEY environment variable');

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (!endpoint)
    throw new Error(
      'Please set the AZURE_OPENAI_ENDPOINT environment variable',
    );

  return new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
}

function uniqueMetadataByFullContent(
  metadataArr: HandbookItemMetadata[],
): HandbookItemMetadata[] {
  const isDuplicate = (
    uniques: HandbookItemMetadata[],
    item: HandbookItemMetadata,
  ): boolean => uniques.some((u) => u.fullContent === item.fullContent);

  const reduceToUniqueContent = (
    uniques: HandbookItemMetadata[],
    item: HandbookItemMetadata,
  ): HandbookItemMetadata[] =>
    isDuplicate(uniques, item) ? uniques : [...uniques, item];

  return metadataArr.reduce(
    reduceToUniqueContent,
    [] as HandbookItemMetadata[],
  );
}

type HandbookItemMetadata = {
  title: string;
  url: string;
  department: string[];
  content: string;
  fullContent: string;
};

type HandbookItemScoredVector = ScoredPineconeRecord<RecordMetadata> & {
  metadata: HandbookItemMetadata;
};

function isHandbookItemScoredVector(
  scoredVector: ScoredPineconeRecord<RecordMetadata>,
): scoredVector is HandbookItemScoredVector {
  return (
    !!scoredVector.metadata &&
    'title' in scoredVector.metadata &&
    'url' in scoredVector.metadata &&
    'department' in scoredVector.metadata &&
    'content' in scoredVector.metadata &&
    'fullContent' in scoredVector.metadata
  );
}

async function queryHandbookIndex(
  queryEmbedding: number[],
): Promise<HandbookItemScoredVector[]> {
  const pinecone = await createPineconeClient();

  const index = pinecone.Index(config.indexName).namespace(config.namespace);
  const queryRequest: QueryOptions = {
    vector: queryEmbedding,
    topK: 3,
    includeValues: false,
    includeMetadata: true,
  };

  const queryResponse = (await index.query(queryRequest));

  if (!queryResponse?.matches?.length) {
    throw new Error('No matches found');
  }

  return queryResponse.matches.filter(isHandbookItemScoredVector);
}

async function createPineconeClient() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey)
    throw new Error('Please set the PINECONE_API_KEY environment variable');

  // const environment = process.env.PINECONE_API_ENVIRONMENT;
  // if (!environment)
  //   throw new Error(
  //     'Please set the PINECONE_API_ENVIRONMENT environment variable',
  //   );

  const pinecone = new Pinecone({apiKey});

  return pinecone;
}
