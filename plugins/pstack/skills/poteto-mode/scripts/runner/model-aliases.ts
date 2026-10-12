const rollingClaudeAliases = ["fable", "opus", "sonnet", "haiku"] as const;

export type RollingClaudeAlias = (typeof rollingClaudeAliases)[number];

export function isRollingClaudeAlias(
  model: string
): model is RollingClaudeAlias {
  return (rollingClaudeAliases as readonly string[]).includes(model);
}

export function versionedClaudeAlias(
  model: string
): RollingClaudeAlias | null {
  return rollingClaudeAliases.find((alias) =>
    new RegExp(`^claude-${alias}-[0-9]+(?:-[0-9]+)*$`).test(model)
  ) ?? null;
}

export function concreteModelMatchesRollingAlias(
  requested: string,
  reported: string
): boolean {
  return versionedClaudeAlias(reported) === requested;
}
