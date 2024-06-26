import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Generate embeddings for the handbook index.
 * An embedding is basically an array with numbers generated by the API based on a text input,
 * which captures and express the relationships and similarities between the words in the text.
 * These arrays are saved to a vector-database, which we can query at a later point to find similar text items.
 */
export async function generateEmbeddings(index) {
  const { azureOpenAIKey, azureOpenAIEndpoint, pineconeApiKey, isProduction } =
    getEnvironmentVariables();

  console.log('Running merge on index, current item count:', index.length);

  // The index generated for the handbook is split up a bit too fine,
  // so we merge similar items together to get better results.
  const mergedIndex = mergeContentForIdenticalItems(index);

  console.log('Item count after merge:', mergedIndex.length);

  const openaiClient = new OpenAIClient(
    azureOpenAIEndpoint,
    new AzureKeyCredential(azureOpenAIKey),
  );

  const pinecone = new Pinecone({ apiKey: pineconeApiKey });

  const indexName = 'handbook-index';
  const indexVectorNamespace = 'handbook-namespace';

  const pineconeIndex = pinecone
    .Index(indexName)
    .namespace(indexVectorNamespace);

  console.log('Updating index', indexName);
  const progress = new cliProgress.SingleBar(
    {
      format:
        "{bar} | {percentage}% | {value}/{total} items | Operation: '{operation}' | ETA {eta}s",
    },
    cliProgress.Presets.shades_classic,
  );

  progress.start(mergedIndex.length, 0, {
    operation: 'N/A',
  });

  let errorCount = 0;
  for (let i = 0; i < mergedIndex.length; i++) {
    const { content, url, title, department, fullContent } = mergedIndex[i];

    // Need to replace newlines with spaces for embeddings
    // apparently leads to better results
    const input = `${title}: ${content}`.replace(/\n/g, ' ');
    const inputChecksum = createHash('sha256').update(input).digest('base64');

    try {
      progress.update(i, { operation: 'Creating embedding' });

      const embedding = await createEmbedding(input, openaiClient);

      progress.update(i, { operation: 'Inserting embedding' });
      await pineconeIndex.upsert([
        {
          id: inputChecksum,
          values: embedding,
          metadata: {
            title: title ?? '',
            content,
            fullContent,
            url,
            department,
          },
        },
      ]);
      progress.update(i + 1);
    } catch (e) {
      errorCount++;

      if (isProduction) {
        console.error(
          'Failed creating or inserting embedding for input:',
          input,
        );
      } else {
        // Only log full error if not production
        // Can't properly control format of OpenAI and Pinecone libs
        // (they love logging API keys etc.)
        console.error(e);
      }

      if (errorCount > 3) {
        const abortError = new Error('Failed several times in a row, aborting');
        console.log(abortError);
        throw abortError;
      }
    }
  }

  progress.stop();
}

/**
 *  Calls the OpenAI API to create an embedding for
 * a given input text. Don't try to parallelize
 * this too much as it easily starts throttle/rate limiting
 */
async function createEmbedding(input, openaiClient) {
  try {
    const embeddingResponse = await openaiClient.getEmbeddings(
      'text-embedding-ada-002',
      [input],
    );

    if (!embeddingResponse.data) {
      throw new Error(embeddingResponse.data);
    }

    const [{ embedding }] = embeddingResponse.data;
    return embedding;
  } catch (e) {
    console.error('Error creating embedding with OpenAI API, HTTP status:');
    throw e;
  }
}

/**
 * Function which merges content for similar items
 * when ALL other fields are identical except content
 * then it sets each item with the full content
 */
function mergeContentForIdenticalItems(arr) {
  const merged = {};

  arr.forEach((item) => {
    const key = getItemKey(item);

    if (merged[key]) {
      merged[key].content += '\n\n' + item.content;
    } else {
      merged[key] = item;
    }
  });

  return arr.map((item) => {
    const key = getItemKey(item);

    return { ...item, fullContent: merged[key].content };
  });
}

function getItemKey(item) {
  const itemCopy = { ...item };
  delete itemCopy.content;

  return JSON.stringify(itemCopy);
}

function getEnvironmentVariables() {
  const azureOpenAIKey = process.env.AZURE_OPENAI_API_KEY;
  if (!azureOpenAIKey)
    throw new Error('Please set the AZURE_OPENAI_API_KEY environment variable');

  const azureOpenAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  if (!azureOpenAIEndpoint)
    throw new Error(
      'Please set the AZURE_OPENAI_ENDPOINT environment variable',
    );

  const pineconeApiKey = process.env.PINECONE_API_KEY;
  if (!pineconeApiKey)
    throw new Error('Please set the PINECONE_API_KEY environment variable');

  const pineconeApiEnvironment = process.env.PINECONE_API_ENVIRONMENT;
  if (!pineconeApiEnvironment)
    throw new Error(
      'Please set the PINECONE_API_ENVIRONMENT environment variable',
    );

  return {
    azureOpenAIKey,
    azureOpenAIEndpoint,
    pineconeApiKey,
    pineconeApiEnvironment,
    isProduction: process.env.NODE_ENV === 'production',
  };
}
