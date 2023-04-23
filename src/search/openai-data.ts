import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
import {
  PineconeClient,
  QueryRequest,
  ScoredVector,
} from '@pinecone-database/pinecone';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { codeBlock, oneLine } from 'common-tags';

const config = {
  indexName: 'handbook-index',
  namespace: 'handbook-namespace',
  embeddingModel: 'text-embedding-ada-002',
  queryModel: 'text-davinci-003',
};

export async function queryOpenai(query: string): Promise<string[]> {
  const openai = await createOpenAIClient();
  // Moderate the content to comply with OpenAI T&C
  const moderationResponse = await openai.createModeration({ input: query });
  const [results] = moderationResponse.data.results;
  if (results.flagged) {
    throw new Error("Doesn't comply with OpenAI T&C");
  }

  const embeddingResponse = await openai.createEmbedding({
    model: config.embeddingModel,
    input: query,
  });

  if (embeddingResponse.status !== 200) {
    throw new Error(JSON.stringify(embeddingResponse.data));
  }

  const [{ embedding }] = embeddingResponse.data.data;

  const scoredHandbookItems = await queryHandbookIndex(embedding);

  const uniqueMetadatas = uniqueMetadataByFullContent(
    scoredHandbookItems.map((s) => s.metadata),
  );

  const contextText = getContextText(uniqueMetadatas);

  const prompt = getPrompt(query, contextText);

  const completionOptions: CreateCompletionRequest = {
    model: config.queryModel,
    prompt,
    max_tokens: 512,
    temperature: 0,
    stream: false,
  };
  const res = await openai.createCompletion(completionOptions);
  const { choices } = res.data;
  return choices.map((c) => c.text).filter(Boolean) as string[];
}

function getPrompt(query: string, contextText: string) {
  const prompt = codeBlock`
  ${oneLine`
    Du er en veldig entusiastisk Variant-representant som elsker
    å hjelpe mennesker! Gitt følgende seksjoner fra Variant-håndboken,
    svar på spørsmålet ved å bruke bare den informasjonen,
    utgitt i markdown-format. Hvis du er usikker og svaret
    ikke er skrevet i dokumentasjonen, si
    "Beklager, jeg vet ikke hvordan jeg kan hjelpe med det."
    Vennligst ikke skriv URL-er som du ikke finner i kontekstseksjonen.

    Vennligst svar på språket som blir spurt på, mest sannsynlig norsk. Kontekstseksjonene er også på norsk.
  `}

  Kontekstseksjon:
  ${contextText}

  Spørsmål: """
  ${query}
  """
`;

  return prompt;
}

function getContextText(metadataArr: HandbookItemMetadata[]) {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;
  let contextText = '';
  for (let { title, fullContent } of metadataArr) {
    const text = title + ' - ' + fullContent.replace(/\n/g, ' ');
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    contextText += `${text.trim()}\n---\n`;
  }
  return contextText;
}

async function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey)
    throw new Error('Please set the OPENAI_API_KEY environment variable');

  const configuration = new Configuration({
    apiKey,
  });

  return new OpenAIApi(configuration);
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

type HandbookItemScoredVector = ScoredVector & {
  metadata: HandbookItemMetadata;
};

function isHandbookItemScoredVector(
  scoredVector: ScoredVector,
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

  const index = pinecone.Index(config.indexName);
  const queryRequest: QueryRequest = {
    vector: queryEmbedding,
    topK: 5,
    includeValues: false,
    includeMetadata: true,
    namespace: config.namespace,
  };
  const queryResponse = await index.query({ queryRequest });

  if (!queryResponse?.matches?.length) {
    throw new Error('No matches found');
  }

  return queryResponse.matches.filter(isHandbookItemScoredVector);
}

async function createPineconeClient() {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey)
    throw new Error('Please set the PINECONE_API_KEY environment variable');

  const environment = process.env.PINECONE_API_ENVIRONMENT;
  if (!environment)
    throw new Error(
      'Please set the PINECONE_API_ENVIRONMENT environment variable',
    );

  const pinecone = new PineconeClient();
  await pinecone.init({
    environment,
    apiKey,
  });

  return pinecone;
}
