"use client"

import React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { Check, Copy } from "lucide-react"

// Monochrome Prism theme — the whole site is black-and-white
const monochrome: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': { color: "#e5e5e5", background: "none" },
  'pre[class*="language-"]': { color: "#e5e5e5", background: "transparent" },
  comment: { color: "#525252", fontStyle: "italic" },
  prolog: { color: "#525252" },
  doctype: { color: "#525252" },
  cdata: { color: "#525252" },
  punctuation: { color: "#737373" },
  operator: { color: "#a3a3a3" },
  keyword: { color: "#ffffff", fontWeight: 500 },
  boolean: { color: "#ffffff" },
  number: { color: "#d4d4d4" },
  string: { color: "#a3a3a3" },
  "template-string": { color: "#a3a3a3" },
  char: { color: "#a3a3a3" },
  function: { color: "#f5f5f5" },
  "class-name": { color: "#f5f5f5" },
  tag: { color: "#e5e5e5" },
  "attr-name": { color: "#a3a3a3" },
  "attr-value": { color: "#a3a3a3" },
  variable: { color: "#e5e5e5" },
  constant: { color: "#e5e5e5" },
  property: { color: "#d4d4d4" },
  interpolation: { color: "#e5e5e5" },
  "interpolation-punctuation": { color: "#737373" },
}

type CodeBlockProps = {
  language: string
  filename: string
  highlightLines?: number[]
} & (
  | {
      code: string
      tabs?: never
    }
  | {
      code?: never
      tabs: Array<{
        name: string
        code: string
        language?: string
        highlightLines?: number[]
      }>
    }
)

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines = [],
  tabs = [],
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState(0)

  const tabsExist = tabs.length > 0

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const activeCode = tabsExist ? tabs[activeTab].code : code
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || []
    : highlightLines

  return (
    <div className="relative w-full rounded-lg border border-white/10 bg-neutral-950 p-4 font-mono text-sm">
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-3 !py-2 text-xs transition-colors font-sans ${
                  activeTab === index
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-zinc-400">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={monochrome}
        lineNumberStyle={{ color: "#404040", minWidth: "2.25em" }}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem",
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(255,255,255,0.1)"
              : "transparent",
            display: "block",
            width: "100%",
          },
        })}
        PreTag="div"
      >
        {String(activeCode)}
      </SyntaxHighlighter>
    </div>
  )
}
