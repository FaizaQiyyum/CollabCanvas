/**
 * AI Tutor — 100% Offline Rule-Based Engine
 *
 * This system generates structured educational responses locally.
 * No external APIs, no API keys, no network dependencies.
 */

export interface TutorResponse {
  topic: string;
  simple: string;
  technical: string;
  example: string;
  quiz: string;
}

export async function getLearningSupport(input: string): Promise<TutorResponse> {
  const t = input.trim().toLowerCase();
  const originalTopic = input.trim() || 'this concept';
  
  // Fake network delay for a realistic "AI thinking" experience in the UI
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. Detect user question type using keyword matching
  const isCoding = /code|coding|program|javascript|python|react|function|algorithm|variable|loop|class|api|html|css|java|c\+\+|sql/i.test(t);
  const isScience = /physics|newton|gravity|force|energy|atom|molecule|quantum|chemistry|biology|cell|dna|science|astronomy|planet/i.test(t);
  const isMath = /math|calculus|algebra|equation|geometry|trigonometry|integral|derivative|theorem|number|fraction|percentage/i.test(t);
  const isHistory = /history|war|roman|empire|president|king|queen|ancient|century|revolution/i.test(t);

  let topic = originalTopic;
  let simple = '';
  let technical = '';
  let example = '';
  let quiz = '';

  // 2. Return structured educational responses based on the detected type
  if (isCoding) {
    simple = `${topic} is a programming concept that helps developers write cleaner, more efficient, and reusable code. It's a foundational building block in software engineering.`;
    technical = `In computer science, ${topic} is used to structure logic, manage data flow, or improve algorithmic performance. By leveraging this concept, systems become more modular. For example:\n\nfunction example() {\n  return "${topic}";\n}`;
    example = `Large-scale platforms like Netflix and Uber rely heavily on ${topic} to handle millions of users efficiently without crashing or slowing down.`;
    quiz = `Can you write a small 3-line code snippet that demonstrates ${topic} in any language you know?`;
  } else if (isScience) {
    simple = `${topic} is a core scientific concept that explains how the natural world behaves under specific conditions. It helps scientists predict and understand physical or chemical phenomena.`;
    technical = `Scientifically, ${topic} is governed by measurable laws and formulas. It typically involves variables interacting within a closed or open system to produce consistent, repeatable outcomes.`;
    example = `A classic application of ${topic} is seen every day in modern engineering — from designing aerodynamic airplanes to developing new medical treatments at the molecular level.`;
    quiz = `If you had to demonstrate ${topic} using a simple experiment at home, what would you do?`;
  } else if (isMath) {
    simple = `${topic} is a mathematical concept used to solve problems involving numbers, shapes, or patterns. It gives us a systematic, logical way to work through complex challenges.`;
    technical = `Mathematically, ${topic} is built on axioms and proven theorems. It often involves applying specific operations or geometric properties to reach a quantifiable, exact solution.`;
    example = `Engineers use ${topic} to calculate structural stress on bridges. Economists use it to model market growth rates. It appears wherever precise quantitative reasoning is needed.`;
    quiz = `Can you write down a simple example equation or word problem that uses ${topic}?`;
  } else if (isHistory) {
    simple = `${topic} represents a significant period, event, or figure in history that shaped how societies and cultures developed over time.`;
    technical = `From a historical perspective, ${topic} involves complex socio-political dynamics, cause-and-effect relationships, and shifts in human civilization that historians analyze using primary sources.`;
    example = `The long-term impact of ${topic} can still be seen today in modern borders, laws, cultural traditions, and even the languages we speak.`;
    quiz = `What do you think is the single most important lesson modern society can learn from ${topic}?`;
  } else {
    // General Knowledge Fallback
    simple = `${topic} is an important concept worth understanding deeply. It connects ideas across different fields and helps us make sense of the world around us.`;
    technical = `From a structured perspective, ${topic} involves specific principles, relationships, and frameworks that experts use to analyze problems and develop comprehensive solutions.`;
    example = `In practice, ${topic} appears in many real-world scenarios — from everyday decision-making to professional fields like business, arts, and technology.`;
    quiz = `How would you explain ${topic} to someone who has never heard of it before?`;
  }

  // 3. Responses follow the strict format expected by the frontend
  return { topic, simple, technical, example, quiz };
}
