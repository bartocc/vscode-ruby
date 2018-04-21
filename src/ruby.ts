/**
 * vscode-ruby main
 */
import { ExtensionContext, languages, workspace } from 'vscode';
import * as client from 'vscode-ruby-client';

import * as utils from './utils';

import { registerCompletionProvider } from './providers/completion';
import { registerFormatter } from './providers/formatter';
import { registerHighlightProvider } from './providers/highlight';
import { registerIntellisenseProvider } from './providers/intellisense';
import { registerLinters } from './providers/linters';
import { registerTaskProvider } from './task/rake';

const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
	{ language: 'ruby', scheme: 'file' },
	{ language: 'ruby', scheme: 'untitled' }
];

export function activate(context: ExtensionContext): void {
	// register language config
	languages.setLanguageConfiguration('ruby', {
		indentationRules: {
			increaseIndentPattern: /^(\s*(module|class|((private|protected)\s+)?def|unless|if|else|elsif|case|when|begin|rescue|ensure|for|while|until|(?=.*?\b(do|begin|case|if|unless)\b)("(\\.|[^\\"])*"|'(\\.|[^\\'])*'|[^#"'])*(\s(do|begin|case)|[-+=&|*/~%^<>~]\s*(if|unless)))\b(?![^;]*;.*?\bend\b)|("(\\.|[^\\"])*"|'(\\.|[^\\'])*'|[^#"'])*(\((?![^\)]*\))|\{(?![^\}]*\})|\[(?![^\]]*\]))).*$/,
			decreaseIndentPattern: /^\s*([}\]]([,)]?\s*(#|$)|\.[a-zA-Z_]\w*\b)|(end|rescue|ensure|else|elsif|when)\b)/,
		},
		wordPattern: /(-?\d+(?:\.\d+))|(:?[A-Za-z][^-`~@#%^&()=+[{}|;:'",<>/.*\]\s\\!?]*[!?]?)/,
	});

	if (workspace.getConfiguration('ruby').useLanguageServer) {
		client.activate(context);
	} else {
		// Register legacy providers
		registerHighlightProvider(context, DOCUMENT_SELECTOR);
	}

	// Register providers
	registerCompletionProvider(context, DOCUMENT_SELECTOR);
	registerFormatter(context, DOCUMENT_SELECTOR);

	if (workspace.rootPath) {
		registerLinters(context);
		registerIntellisenseProvider(context);
		registerTaskProvider(context);
	}

	utils.loadEnv();
}

export function deactivate(): void {
	client.deactivate();

	return undefined;
}
