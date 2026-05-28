import { z } from 'zod';

// Zod schema for input validation to prevent injection attacks
export const AddressInputSchema = z.object({
  address: z.string().min(5).max(200).trim(),
});

export type AddressInput = z.infer<typeof AddressInputSchema>;

/**
 * Server-side utility to interact with the Google Civic Information API.
 * Data Minimization Rule: The address must only be used to fetch data and immediately discarded.
 * It should never be stored in a database or logged.
 */
export async function getCivicInformation(address: string, endpoint: 'voterInfoQuery' | 'representativesInfoByAddress' = 'voterInfoQuery') {
  // Validate input securely
  const validatedInput = AddressInputSchema.parse({ address });

  const apiKey = process.env.GOOGLE_CIVIC_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_CIVIC_API_KEY is not defined in environment variables.');
  }

  // Construct the URL
  const baseUrl = `https://www.googleapis.com/civicinfo/v2`;
  // If using voterInfoQuery, electionId is required or defaults to 2000 (VIP Test Election) if not specified
  const url = `${baseUrl}/${endpoint}?address=${encodeURIComponent(validatedInput.address)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
         // Graceful error handling when no data is found for an address
         return {
           success: false,
           message: 'I cannot find verified data for that location at this time.',
           data: null,
         };
      }
      throw new Error(data.error?.message || 'Failed to fetch Civic Information');
    }

    return {
      success: true,
      message: 'Data retrieved successfully',
      data,
    };
  } catch (error) {
    console.error('Civic API Fetch Error:', error);
    return {
      success: false,
      message: 'I cannot find verified data for that location at this time.',
      data: null,
    };
  }
}
