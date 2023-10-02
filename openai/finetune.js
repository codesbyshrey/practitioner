require('dotenv').config();
const OpenAI = require('openai');

const fs = require('fs');
const readline = require('readline');
const openai = new OpenAI({ apiKey: process.env.API_KEY })

async function validateJSONL(file) {
     const fileStream = fs.createReadStream(file);

     const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
     });

     let lineNumber = 0;
     for await (const line of rl) {
          lineNumber++;
          try {
               JSON.parse(line);
          } catch(e) {
               console.error(`Invalid JSON object at line ${lineNumber}: ${e.message}`);
               return false;
          }
     }

     console.log('File is a valid JSONL file');
     return true;
}

// STEP 1: UPLOAD THE DATASET AND FINE TUNE THE MODEL
async function uploadDataset() {
     if (await validateJSONL('dataset.jsonl')) {
          const status = await openai.files.create({
               file: fs.createReadStream('dataset.jsonl'),
               purpose: 'fine-tune',
          });
          console.log(status);
          return status.id;
     }
     return null;
}

// STEP 2: FINE TUNE MODEL WITH THE TRAINING FILE ID FROM PREVIOUS STEP
async function fineTuneModel(trainingFileId) {
     const fineTune = await openai.fineTuning.jobs.create({
          training_file: trainingFileId,
          model: 'gpt-3.5-turbo',
     });
     console.log(fineTune);
     // Wait for email confirmation that fine tuning is complete before proceeding
}

// GET COMPLETION AND REPLACE MODELID WITH THE RECEIVED VALUE FROM THE EMAIL
async function getModelCompletion(modelId) {
     const completion = await openai.chat.completions.create({
          messages: [
               {
                    role: 'user',
                    content: 'Should I include previous work on my resume note related to tech?',
               }
          ],
          model: modelId,
     });
     console.log(completion.choices[0].message.content);
}

// Uncomment the function you want to run based on the step you're at:
// uploadDataset(); 
// Step 1: Upload the dataset
// fineTuneModel('YOUR_FILE_ID'); 
// Step 2: Fine-tune the model. Replace 'YOUR_FILE_ID' with the file ID from the previous step.
// getModelCompletion('YOUR_FINE_TUNED_MODEL_ID'); 
// Step 3: Get a completion. Replace 'YOUR_FINE_TUNED_MODEL_ID' with the model ID from the email.


// Last step is to expose function via API so that users can use it to upload their own dataset or leverage a particular model that you have trained for them.

// Can use it to build a model with specific business logic, advanced chat bot, more specific content creation, and improved responses for current events since we have a knowledge gap following 2021 or so.