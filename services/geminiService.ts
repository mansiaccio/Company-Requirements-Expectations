
import { GoogleGenAI, Type } from "@google/genai";
import { FullAnalysisResponse, InterviewInputs } from "../types";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    intelligence: {
      type: Type.OBJECT,
      properties: {
        oneLiner: { type: Type.STRING },
        expandedDescription: { type: Type.STRING },
        industry: { type: Type.STRING },
        productCategory: { type: Type.STRING },
        scale: { type: Type.STRING },
        indiaPresence: { type: Type.STRING },
        customersUseCases: { type: Type.ARRAY, items: { type: Type.STRING } },
        orientation: { type: Type.STRING }
      },
      required: ["oneLiner", "expandedDescription", "industry", "productCategory", "scale", "indiaPresence", "customersUseCases", "orientation"]
    },
    jdBreakdown: {
      type: Type.OBJECT,
      properties: {
        coreResponsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
        toolsActuallyUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
        toolsListedButLessUsed: { type: Type.ARRAY, items: { type: Type.STRING } },
        fresherExpectations: { type: Type.ARRAY, items: { type: Type.STRING } },
        first90DayOutcomes: { type: Type.ARRAY, items: { type: Type.STRING } },
        dayToDaySplit: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              activity: { type: Type.STRING },
              percentage: { type: Type.NUMBER }
            },
            required: ["activity", "percentage"]
          }
        }
      },
      required: ["coreResponsibilities", "toolsActuallyUsed", "toolsListedButLessUsed", "fresherExpectations", "first90DayOutcomes", "dayToDaySplit"]
    },
    rejectionAnalyzer: {
      type: Type.OBJECT,
      properties: {
        toolLevelGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        thinkingGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        communicationGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        resumeMismatch: { type: Type.ARRAY, items: { type: Type.STRING } },
        brutalHonesty: { type: Type.STRING }
      },
      required: ["toolLevelGaps", "thinkingGaps", "communicationGaps", "resumeMismatch", "brutalHonesty"]
    }
  },
  required: ["intelligence", "jdBreakdown", "rejectionAnalyzer"]
};

export const analyzeInterviewContext = async (inputs: InterviewInputs): Promise<FullAnalysisResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Act as a senior technical recruiter and company researcher. 
    Analyze the following interview context for a candidate. 
    Do not hallucinate facts. If information is missing, infer logically from the industry or typical company scale, but prioritize facts from the input.
    
    Inputs:
    Company Name: ${inputs.companyName}
    Website: ${inputs.websiteUrl}
    LinkedIn: ${inputs.linkedinUrl}
    JD: ${inputs.jobDescription}
    Technical Rounds Info: ${inputs.techRoundsInfo}
    Additional Context: ${inputs.additionalContext || "None provided"}
    
    Tasks:
    1. Extract company intelligence (scale, presence in India, core product).
    2. Breakdown the JD into actionable outcomes and reality-checks (e.g., tools listed vs used).
    3. Analyze typical rejection reasons for freshers in this specific context.
    
    The "brutalHonesty" section should start with: "Here’s why people like you usually get rejected." 
    Make it direct, professional, and insight-driven.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.2, // Keep it factual and consistent
    },
  });

  const text = response.text;
  if (!text) throw new Error("Failed to get analysis from Gemini.");
  
  return JSON.parse(text) as FullAnalysisResponse;
};
