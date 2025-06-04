export async function loadAllIntents() {
  const response = await fetch('/intent_data.json');
  const data = await response.json();

  const ids = Object.keys(data.intent_id);

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
