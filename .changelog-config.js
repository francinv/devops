"use strict";

// This config customizes the changelog generation.
// It defines which commit types get which section headings, adds emojis,
// and ensures that 'chore' commits are visible under their own section.

const types = [
  { type: "feat", section: "✨ Features" },
  { type: "fix", section: "🐛 Bug Fixes" },
  { type: "chore", section: "Miscellaneous Tasks", hidden: false },
  { type: "docs", section: "📝 Documentation", hidden: false },
  { type: "style", section: "💄 Styles", hidden: false },
  { type: "refactor", section: "♻️ Code Refactoring", hidden: false },
  { type: "perf", section: "⚡ Performance Improvements", hidden: false },
  { type: "test", section: "✅ Tests", hidden: false },
  { type: "build", section: "📦 Build System", hidden: false },
  { type: "ci", section: "🎡 Continuous Integration", hidden: false },
  { type: "revert", section: "⏪ Reverts", hidden: false },
];

module.exports = {
  writerOpts: {
    transform: (commit, context) => {
      // Find the type configuration for the current commit
      const typeConfig = types.find((type) => type.type === commit.type);

      // If the commit type is not in our list, skip it
      if (!typeConfig) {
        return null;
      }

      // Set the commit's display type to the section title (e.g., '✨ Features')
      commit.type = typeConfig.section;

      // Standard transformations for linking issues and users
      if (commit.scope === `*`) {
        commit.scope = ``;
      }
      if (typeof commit.hash === `string`) {
        commit.shortHash = commit.hash.substring(0, 7);
      }
      if (typeof commit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          commit.subject = commit.subject.replace(/#([0-9]+)/g, (_, issue) => {
            return `[#${issue}](${url}${issue})`;
          });
        }
        if (context.host) {
          // User URLs.
          commit.subject = commit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
            `[@$1](${context.host}/$1)`
          );
        }
      }

      return commit;
    },
    // Group commits by the 'type' field we just transformed
    groupBy: "type",
    // Sort the groups by title
    commitGroupsSort: "title",
    // Sort commits inside each group
    commitsSort: ["scope", "subject"],
  },
};
