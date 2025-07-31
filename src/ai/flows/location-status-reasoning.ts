'use server';
/**
 * @fileOverview Determines a student's location status (in breach or not in breach).
 *
 * - getLocationStatus - A function that determines the location status.
 * - LocationStatusInput - The input type for the getLocationStatus function.
 * - LocationStatusOutput - The return type for the getLocationStatus function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LocationStatusInputSchema = z.object({
  isBreaching: z.boolean().describe('Whether the student is breaching the geofence.'),
  studentName: z.string().describe('The name of the student.'),
  studentId: z.string().describe('The ID of the student.'),
  locationCoordinates: z.string().describe('The location coordinates of the student.'),
  timeOfBreach: z.string().describe('The time the breach occurred.'),
});
export type LocationStatusInput = z.infer<typeof LocationStatusInputSchema>;

const LocationStatusOutputSchema = z.object({
  status: z.string().describe('The location status of the student (in breach or not in breach).'),
  notificationMessage: z.string().describe('A message summarizing the location status and breach details.'),
});
export type LocationStatusOutput = z.infer<typeof LocationStatusOutputSchema>;

export async function getLocationStatus(input: LocationStatusInput): Promise<LocationStatusOutput> {
  return locationStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'locationStatusPrompt',
  input: {schema: LocationStatusInputSchema},
  output: {schema: LocationStatusOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI assistant that determines the location status of a student and generates a notification message.

  Based on the following information, determine if the student is in breach or not in breach. Then generate a notification message summarizing the situation.

  Student Name: {{{studentName}}}
  Student ID: {{{studentId}}}
  Location Coordinates: {{{locationCoordinates}}}
  Time of Breach: {{{timeOfBreach}}}
  Is Breaching: {{#if isBreaching}}Yes{{else}}No{{/if}}

  Status: Determine if the student is in breach or not in breach.

  Notification Message: Generate a message summarizing the location status and breach details. Include the student's name, ID, location coordinates, and time of breach.
  `,
});

const locationStatusFlow = ai.defineFlow(
  {
    name: 'locationStatusFlow',
    inputSchema: LocationStatusInputSchema,
    outputSchema: LocationStatusOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
