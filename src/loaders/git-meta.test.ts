import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import { augmentWithGitMeta, getGitMeta } from "./git-meta.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
// Repo root = project root (one level up from src/loaders)
const repoRoot = path.resolve(here, "..", "..");
// A real, committed markdown file under the handbook collection.
const knownFile = path.join(
	repoRoot,
	"src/content/handbook/avdelinger/oslo.md",
);

const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/;
const SHA_RE = /^[0-9a-f]{40}$/;

describe("getGitMeta", () => {
	it("returns metadata for a committed handbook file", () => {
		const meta = getGitMeta(knownFile);

		assert.ok(meta, "expected metadata for a committed file");
		assert.match(
			meta!.commitSha,
			SHA_RE,
			"commitSha should be a 40-char hex string",
		);
		assert.match(meta!.date, ISO_RE, "date should be strict ISO 8601");
		assert.match(
			meta!.relPath,
			/^src\/content\/handbook\/avdelinger\/oslo\.md$/,
			"relPath should be relative to the repo root",
		);
		assert.match(
			meta!.repoSlug,
			/^[^/]+\/[^/]+$/,
			"repoSlug should be an owner/repo pair",
		);
		assert.match(
			meta!.pathHash,
			/^[0-9a-f]{64}$/,
			"pathHash should be a 64-char hex string (SHA256 of relPath)",
		);
	});

	it("the returned sha matches `git log -1` for that file", () => {
		const meta = getGitMeta(knownFile);
		const expected = execFileSync(
			"git",
			["log", "-1", "--format=%H", "--", knownFile],
			{
				encoding: "utf-8",
			},
		).trim();

		assert.equal(meta?.commitSha, expected);
	});

	it("returns null for a nonexistent path", () => {
		const meta = getGitMeta(
			path.join(repoRoot, "src/content/handbook/does-not-exist.md"),
		);
		assert.equal(meta, null);
	});

	it("returns null for an untracked file", () => {
		const tmp = path.join(
			repoRoot,
			"src/content/handbook/__untracked_test__.md",
		);
		// Create, query, remove — leaves the working tree clean.
		fs.writeFileSync(tmp, "# temp\n");
		try {
			const meta = getGitMeta(tmp);
			assert.equal(meta, null);
		} finally {
			fs.unlinkSync(tmp);
		}
	});

	it("never throws on paths outside the repo", () => {
		const meta = getGitMeta("/tmp/somewhere/definitely/not/a/repo/file.md");
		assert.equal(meta, null);
	});
});

describe("augmentWithGitMeta", () => {
	it("stamps a lastCommit object with sha/date/relPath/repoSlug onto data for a committed file", () => {
		const out = augmentWithGitMeta(knownFile, { title: "Oslo", order: 1 });

		assert.equal(out.title, "Oslo", "preserves original fields");
		assert.equal(out.order, 1, "preserves original fields");
		assert.ok(out.lastCommit, "lastCommit should be set for a committed file");
		assert.match(out.lastCommit!.commitSha, SHA_RE);
		assert.match(out.lastCommit!.date, ISO_RE);
		assert.match(
			out.lastCommit!.relPath,
			/^src\/content\/handbook\/avdelinger\/oslo\.md$/,
		);
		assert.match(out.lastCommit!.repoSlug, /^[^/]+\/[^/]+$/);
		assert.match(out.lastCommit!.pathHash, /^[0-9a-f]{64}$/);
	});

	it("matches getGitMeta exactly (no divergence between helper and augmentation)", () => {
		const out = augmentWithGitMeta(knownFile, {});
		const direct = getGitMeta(knownFile);
		assert.deepEqual(out.lastCommit, direct);
	});

	it("produces null lastCommit when filePath is undefined", () => {
		const out = augmentWithGitMeta(undefined, { title: "No file" });
		assert.equal(out.lastCommit, null);
		assert.equal(out.title, "No file");
	});

	it("produces null lastCommit for an untracked file", () => {
		const tmp = path.join(
			repoRoot,
			"src/content/handbook/__untracked_augment__.md",
		);
		fs.writeFileSync(tmp, "# temp\n");
		try {
			const out = augmentWithGitMeta(tmp, { title: "x" });
			assert.equal(out.lastCommit, null);
		} finally {
			fs.unlinkSync(tmp);
		}
	});

	it("does not mutate the input data", () => {
		const input = { title: "Oslo", order: 1 };
		const snapshot = { ...input };
		augmentWithGitMeta(knownFile, input);
		assert.deepEqual(input, snapshot, "input object must be untouched");
	});

	it("augmented sha matches git log -1 for the file", () => {
		const out = augmentWithGitMeta(knownFile, {});
		const expected = execFileSync(
			"git",
			["log", "-1", "--format=%H", "--", knownFile],
			{
				encoding: "utf-8",
			},
		).trim();
		assert.equal(out.lastCommit?.commitSha, expected);
	});
});
