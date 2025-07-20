export async function loadAllIntents() {
  // Use absolute URL for server-side fetch, relative for client-side
  let url = '';
  if (typeof window === 'undefined') {
    // On server, construct absolute URL
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    url = `${base}/intent_data_new_titles_v01.json`;
  } else {
    // On client
    url = '/intent_data_new_titles_v01.json';
  }
  const response = await fetch(url);
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
    title_new: data.title_new[id],
    description_new: data.description_new[id],
  }));

  return allIntents;
}
