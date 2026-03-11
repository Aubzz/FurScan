/**
 * tokenCounter.ts
 * 
 * Utility functions for estimating and tracking token usage
 * Uses a simple heuristic: ~4 characters per token on average
 * This is conservative to avoid exceeding limits
 */

/**
 * Estimate token count for a given text
 * Using the rule of thumb: 1 token ≈ 4 characters (English)
 * 
 * @param text - The text to estimate tokens for
 * @returns Estimated token count
 */
export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  
  // Conservative estimate: divide character count by 4
  // This accounts for punctuation, spaces, and word boundaries
  const estimatedTokens = Math.ceil(text.length / 4);
  
  // Minimum 1 token per message (even if very short)
  return Math.max(1, estimatedTokens);
};

/**
 * Calculate total tokens used in a conversation
 * 
 * @param messages - Array of messages with text content
 * @returns Total token count
 */
export const calculateTotalTokens = (
  messages: Array<{ content: string; tokens_used?: number }>
): number => {
  if (!messages || messages.length === 0) return 0;
  
  return messages.reduce((total, msg) => {
    // If tokens_used is already defined (from backend), use it
    // Otherwise estimate from content
    const tokens = msg.tokens_used || estimateTokens(msg.content);
    return total + tokens;
  }, 0);
};

/**
 * Check if adding a message would exceed token limit
 * 
 * @param currentTokens - Current total tokens used
 * @param messageText - The message text to send
 * @param maxLimit - Maximum token limit allowed
 * @returns True if within limits, false if would exceed
 */
export const isWithinTokenLimit = (
  currentTokens: number,
  messageText: string,
  maxLimit: number
): boolean => {
  const messageTokens = estimateTokens(messageText);
  return (currentTokens + messageTokens) <= maxLimit;
};

/**
 * Format token count for display
 * Shows remaining tokens if within a session context
 * 
 * @param currentTokens - Tokens used so far
 * @param maxTokens - Maximum allowed tokens
 * @returns Formatted string for UI display
 */
export const formatTokenDisplay = (
  currentTokens: number,
  maxTokens: number
): { used: string; remaining: string; percentage: number } => {
  const remaining = Math.max(0, maxTokens - currentTokens);
  const percentage = Math.round((currentTokens / maxTokens) * 100);
  
  return {
    used: `${currentTokens}/${maxTokens}`,
    remaining: `${remaining} left`,
    percentage
  };
};

/**
 * Get color indicator based on token usage percentage
 * Green: < 50%, Yellow: 50-80%, Red: > 80%
 * 
 * @param percentage - Token usage percentage
 * @returns Color string for UI
 */
export const getTokenStatusColor = (percentage: number): string => {
  if (percentage >= 80) return '#FF6B6B'; // Red - critical
  if (percentage >= 50) return '#FFA500'; // Orange - warning
  return '#4CAF50'; // Green - healthy
};
