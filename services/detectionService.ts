// // services/detectionService.ts
// //export type DetectionResult = DeepfakeDetectionResult | AIContentDetectionResult;

// export interface DetectionResult {
//   id: string;
//   imageUrl: string;
//   confidence: number;
//   isDeepfake: boolean;
//   errorLevelAnalysis: {
//     description: string;
//     confidence: number;
//     image?: string; // Add this field for Error Level Analysis image
//   };
//   metadataAnalysis: {
//     source: string;
//     inconsistencies: number;
//   };
//   heatmapImage: string;
//   frames?: string[]; // Add this field for frames
// }
  
//   export class DeepfakeDetectionStub {
//     // Simulate deepfake detection
//     static async detectDeepfake(file: File): Promise<DetectionResult> {
//       // Simulate processing time
//       await new Promise(resolve => setTimeout(resolve, 2000));
  
//       // Generate probabilistic results
//       const confidence = Math.round(Math.random() * 100);
//       const isDeepfake = confidence > 50;
  
//       return {
//         id: Date.now().toString(),
//         imageUrl: URL.createObjectURL(file),
//         confidence,
//         isDeepfake,
//         errorLevelAnalysis: {
//           description: this.generateErrorLevelDescription(confidence),
//           confidence: Math.round(Math.random() * 100)
//         },
//         metadataAnalysis: {
//           source: this.generateMetadataSource(isDeepfake),
//           inconsistencies: Math.round(Math.random() * 5)
//         },
//         heatmapImage: this.generateHeatmapImage(isDeepfake)
//       };
//     }
  
//     // Helper methods to generate more contextual descriptions
//     private static generateErrorLevelDescription(confidence: number): string {
//       if (confidence < 30) return 'Consistent pixel compression';
//       if (confidence < 60) return 'Moderate pixel inconsistencies';
//       return 'Significant pixel compression anomalies';
//     }
  
//     private static generateMetadataSource(isDeepfake: boolean): string {
//       const sources = [
//         'Potential synthetic generation',
//         'Inconsistent metadata signatures',
//         'AI-generated content markers',
//         'Authentic media source',
//         'Standard media metadata'
//       ];
  
//       return isDeepfake 
//         ? sources.slice(0, 3)[Math.floor(Math.random() * 3)]
//         : sources.slice(3)[Math.floor(Math.random() * 2)];
//     }
  
//     private static generateHeatmapImage(isDeepfake: boolean): string {
//       // In a real scenario, this would be dynamically generated
//       return isDeepfake 
//         ? '/path/to/deepfake-heatmap.png'
//         : '/path/to/authentic-heatmap.png';
//     }
//   }

//   export interface AIContentDetectionResult {
//     id: string;
//     imageUrl?: string;
//     textContent?: string;
//     confidence: number;
//     isAIGenerated: boolean;
//     pixelAnalysis: {
//       description: string;
//       confidence: number;
//     };
//     styleAnalysis: {
//       description: string;
//       markers: number;
//     };
//     generationSource: {
//       mostLikelyModel: string;
//       confidence: number;
//     };
//     heatmapImage: string;
//   }
  
//   export class AIContentDetectionStub {
//     // Simulate AI content detection for media
//     static async detectAIContent(file: File): Promise<AIContentDetectionResult> {
//       // Simulate processing time
//       await new Promise(resolve => setTimeout(resolve, 2000));
  
//       // Generate probabilistic results
//       const confidence = Math.round(Math.random() * 100);
//       const isAIGenerated = confidence > 50;
  
//       return {
//         id: Date.now().toString(), // Add unique id
//         imageUrl: URL.createObjectURL(file),
//         confidence,
//         isAIGenerated,
//         pixelAnalysis: {
//           description: this.generatePixelAnalysisDescription(confidence),
//           confidence: Math.round(Math.random() * 100)
//         },
//         styleAnalysis: {
//           description: this.generateStyleAnalysisDescription(isAIGenerated),
//           markers: Math.round(Math.random() * 5)
//         },
//         generationSource: {
//           mostLikelyModel: this.generateGenerationSource(isAIGenerated),
//           confidence: Math.round(Math.random() * 100)
//         },
//         heatmapImage: this.generateHeatmapImage(isAIGenerated)
//       };
//     }
  
//     // Simulate AI content detection for text
//     static async detectTextContent(text: string): Promise<AIContentDetectionResult> {
//       // Simulate processing time
//       await new Promise(resolve => setTimeout(resolve, 2000));
  
//       // Generate probabilistic results
//       const confidence = Math.round(Math.random() * 100);
//       const isAIGenerated = confidence > 50;
  
//       return {
//         id: Date.now().toString(), // Add unique id
//         textContent: text,
//         confidence,
//         isAIGenerated,
//         pixelAnalysis: {
//           description: this.generatePixelAnalysisDescription(confidence),
//           confidence: Math.round(Math.random() * 100)
//         },
//         styleAnalysis: {
//           description: this.generateStyleAnalysisDescription(isAIGenerated),
//           markers: Math.round(Math.random() * 5)
//         },
//         generationSource: {
//           mostLikelyModel: this.generateGenerationSource(isAIGenerated),
//           confidence: Math.round(Math.random() * 100)
//         },
//         heatmapImage: this.generateHeatmapImage(isAIGenerated)
//       };
//     }
  
//     // Rest of the methods remain the same as in the previous implementation
//     // Helper methods to generate more contextual descriptions
//     private static generatePixelAnalysisDescription(confidence: number): string {
//       if (confidence < 30) return 'Consistent pixel patterns';
//       if (confidence < 60) return 'Moderate synthetic pixel variations';
//       return 'Significant AI-generated pixel anomalies';
//     }
  
//     private static generateStyleAnalysisDescription(isAIGenerated: boolean): string {
//       const descriptions = [
//         'Natural style consistency',
//         'Subtle AI generation markers',
//         'Prominent synthetic style indicators',
//         'Potential AI-generated content characteristics',
//         'Advanced generative pattern detection'
//       ];
  
//       return isAIGenerated 
//         ? descriptions.slice(1)[Math.floor(Math.random() * 4)]
//         : descriptions[0];
//     }
  
//     private static generateGenerationSource(isAIGenerated: boolean): string {
//       const aiModels = [
//         'DALL-E',
//         'Midjourney',
//         'Stable Diffusion',
//         'Imagen',
//         'Kandinsky'
//       ];
  
//       return isAIGenerated 
//         ? aiModels[Math.floor(Math.random() * aiModels.length)]
//         : 'Authentic Source';
//     }
  
//     private static generateHeatmapImage(isAIGenerated: boolean): string {
//       // In a real scenario, this would be dynamically generated
//       return isAIGenerated 
//         ? '/path/to/ai-generated-heatmap.png'
//         : '/path/to/authentic-heatmap.png';
//     }
//   }