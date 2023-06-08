import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApi,
} from 'openai';
import {
  PineconeClient,
  QueryRequest,
  ScoredVector,
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

  const assistentTexts: ChatCompletionRequestMessage[] =
    getAssistantTexts(uniqueMetadatas);

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: 'system',
      content:
        'Du er en veldig entusiastisk Variant-representant som elsker å hjelpe mennesker! Gitt følgende fra Variant-håndboken (sendt inn som assistent), svar på spørsmålet ved å bruke bare den informasjonen. Hvis du er usikker og svaret ikke er skrevet i håndboken, si "Beklager, jeg vet ikke hvordan jeg kan hjelpe med det." Vennligst ikke skriv URL-er som du ikke finner i kontekstseksjonen.',
    },
    ...assistentTexts,
    {
      role: 'user',
      content: query,
    },
  ];

  const completionOptions: CreateChatCompletionRequest = {
    model: config.queryModel,
    messages,
    max_tokens: 512,
    temperature: 0,
    stream: false,
  };

  const res = await openai.createChatCompletion(completionOptions);
  const { choices } = res.data;
  return choices.map((c) => c.message?.content).filter(Boolean) as string[];
}

function getAssistantTexts(
  metadataArr: HandbookItemMetadata[],
): ChatCompletionRequestMessage[] {
  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;

  let assistantTexts: ChatCompletionRequestMessage[] = [];
  for (let { title, fullContent } of metadataArr) {
    const text = title + ' - ' + fullContent.replace(/\n/g, ' ');
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    assistantTexts.push({
      role: 'assistant',
      content: text,
    });
  }
  return assistantTexts;
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

  const configuration = new Configuration({
    azure: {
      apiKey,
      endpoint,
    },
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
    topK: 3,
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
