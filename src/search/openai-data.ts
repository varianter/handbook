import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai';
import { PineconeClient, QueryRequest } from '@pinecone-database/pinecone';
import GPT3Tokenizer from 'gpt3-tokenizer';
import { codeBlock, oneLine } from 'common-tags';

const config = {
  indexName: 'handbook-index',
  namespace: 'handbook-namespace',
  embeddingModel: 'text-embedding-ada-002',
  queryModel: 'text-davinci-003',
};

export async function queryOpenai(query: string): Promise<string[]> {
  const { openai, pinecone } = await connect();
  // Moderate the content to comply with OpenAI T&C
  const moderationResponse = await openai.createModeration({ input: query });
  const [results] = moderationResponse.data.results;
  if (results.flagged) {
    throw new Error('Flagged content');
  }

  const embeddingResponse = await openai.createEmbedding({
    model: config.embeddingModel,
    input: query,
  });

  if (embeddingResponse.status !== 200) {
    throw new Error(JSON.stringify(embeddingResponse.data));
  }

  const [{ embedding }] = embeddingResponse.data.data;

  const index = pinecone.Index(config.indexName);
  const queryRequest: QueryRequest = {
    vector: embedding,
    topK: 5,
    includeValues: false,
    includeMetadata: true,
    namespace: config.namespace,
  };
  const queryResponse = await index.query({ queryRequest });

  const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
  let tokenCount = 0;

  if (!queryResponse?.matches?.length) {
    throw new Error('No matches found');
  }

  const uniqueFullContent = queryResponse.matches
    ?.map((m: any) => ({
      title: m.metadata?.title,
      fullContent: m.metadata?.fullContent,
    }))
    .reduce((uniqueArr, item) => {
      const isDuplicate = uniqueArr.some(
        (uniqueObj) =>
          uniqueObj.title === item.title &&
          uniqueObj.fullContent === item.fullContent,
      );

      return isDuplicate ? uniqueArr : [...uniqueArr, item];
    }, [] as { title: string; fullContent: string }[]);
  let contextText = '';
  for (let i = 0; i < uniqueFullContent.length; i++) {
    const uniqueItem = uniqueFullContent[i];
    const { title, fullContent } = uniqueItem;
    const text = title + ' - ' + fullContent.replace(/\n/g, ' ');
    const encoded = tokenizer.encode(text);
    tokenCount += encoded.text.length;

    if (tokenCount >= 1500) {
      break;
    }

    contextText += `${text.trim()}\n---\n`;
  }

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

async function connect() {
  const { openApiKey, pineconeApiEnvironment, pineconeApiKey } =
    getEnvironmentVariables();

  const configuration = new Configuration({
    apiKey: openApiKey,
  });
  const openai = new OpenAIApi(configuration);
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: pineconeApiEnvironment,
    apiKey: pineconeApiKey,
  });

  return { openai, pinecone };
}

function getEnvironmentVariables() {
  const openApiKey = process.env.OPENAI_API_KEY;
  if (!openApiKey)
    throw new Error('Please set the OPENAI_API_KEY environment variable');

  const pineconeApiKey = process.env.PINECONE_API_KEY;
  if (!pineconeApiKey)
    throw new Error('Please set the PINECONE_API_KEY environment variable');

  const pineconeApiEnvironment = process.env.PINECONE_API_ENVIRONMENT;
  if (!pineconeApiEnvironment)
    throw new Error(
      'Please set the PINECONE_API_ENVIRONMENT environment variable',
    );

  return {
    openApiKey,
    pineconeApiKey,
    pineconeApiEnvironment,
  };
}
