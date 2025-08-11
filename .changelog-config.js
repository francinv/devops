"use strict";

// This config customizes the changelog generation.
// It defines which commit types get which section headings, adds emojis,
// and ensures that 'chore' commits are visible under their own section.

const types = [
  { type: "feat", section: "✨ Features" },
  { type: "fix", section: "🐛 Bug Fixes" },
  { type: "chore", section: "🧹 Miscellaneous Tasks", hidden: false },
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
      const typeConfig = types.find((type) => type.type === commit.type);

      if (!typeConfig) {
        return null;
      }

      // Create a new mutable object to avoid modifying the original immutable commit
      const newCommit = { ...commit };

      // Set the commit's display type to the section title (e.g., '✨ Features')
      newCommit.type = typeConfig.section;

      // Standard transformations for linking issues and users
      if (newCommit.scope === `*`) {
        newCommit.scope = ``;
      }
      if (typeof newCommit.hash === `string`) {
        newCommit.shortHash = newCommit.hash.substring(0, 7);
      }
      if (typeof newCommit.subject === `string`) {
        let url = context.repository
          ? `${context.host}/${context.owner}/${context.repository}`
          : context.repoUrl;
        if (url) {
          url = `${url}/issues/`;
          // Issue URLs.
          newCommit.subject = newCommit.subject.replace(
            /#([0-9]+)/g,
            (_, issue) => {
              return `[#${issue}](${url}${issue})`;
            }
          );
        }
        if (context.host) {
          // User URLs.
          newCommit.subject = newCommit.subject.replace(
            /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g,
            `[@$1](${context.host}/$1)`
          );
        }
      }

      return newCommit;
    },
    // Group commits by the 'type' field we just transformed
    groupBy: "type",
    // Sort the groups by title
    commitGroupsSort: "title",
    // Sort commits inside each group
    commitsSort: ["scope", "subject"],
  },
};
