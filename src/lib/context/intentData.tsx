import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'intent_data.json');

export function loadAllIntents() {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);

  const ids = Object.keys(data.intent_id);
  console.log(ids);

  const allIntents = ids.map((id) => ({
    intent_id: data.intent_id[id],
    intent_name: data.intent_name[id],
    main_listening_function: data.main_listening_function[id],
    listening_functions: data.listening_functions[id],
    listening_function_factors: data.listening_function_factors[id],
    survey_intent_names: data.survey_intent_names[id],
    generated_augmented_texts: data.generated_augmented_texts[id],
  }));

  return allIntents;
}
