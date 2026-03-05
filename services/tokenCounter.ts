export const estimateTokens = (text: string): number => {
  if (!text) return 0;
  const estimatedTokens = Math.ceil(text.length / 4);
  return Math.max(1, estimatedTokens);
};

export const calculateTotalTokens = (
  messages: { content: string; tokens_used?: number }[],
): number => {
  if (!messages || messages.length === 0) return 0;

  return messages.reduce((total, msg) => {
    const tokens = msg.tokens_used || estimateTokens(msg.content);
    return total + tokens;
  }, 0);
};

export const isWithinTokenLimit = (
  currentTokens: number,
  messageText: string,
  maxLimit: number,
): boolean => {
  const messageTokens = estimateTokens(messageText);
  return currentTokens + messageTokens <= maxLimit;
};

export const formatTokenDisplay = (
  currentTokens: number,
  maxTokens: number,
): { used: string; remaining: string; percentage: number } => {
  const remaining = Math.max(0, maxTokens - currentTokens);
  const percentage = Math.round((currentTokens / maxTokens) * 100);

  return {
    used: `${currentTokens}/${maxTokens}`,
    remaining: `${remaining} left`,
    percentage,
  };
};

export const getTokenStatusColor = (percentage: number): string => {
  if (percentage >= 80) return "#FF6B6B";
  if (percentage >= 50) return "#FFA500";
  return "#4CAF50";
};
