import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Code,
  CodeBlock,
  Columns,
  Download,
  Eye,
  Hash,
  Image,
  Link,
  ListBullets,
  ListNumbers,
  Minus,
  Pen,
  Quotes,
  TextB,
  TextItalic,
} from "@phosphor-icons/react";
import Markdown from "markdown-to-jsx";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { CONFIG } from "../../../config/config";
import {
  createMarkdownComponents,
  createMarkdownContainerStyles,
  MARKDOWN_OPTIONS,
} from "./markdown-config";

interface MarkdownEditorProps {
  initialValue?: string | undefined;
  onDataChange?: (content: string) => void;
  downloadFilename?: string;
  className?: string;
}

interface MarkdownAction {
  icon: React.ReactNode;
  label: string;
  action: (
    text: string,
    selection: { start: number; end: number },
  ) => { text: string; cursor: number };
}

export interface MarkdownEditorRef {
  bold: () => void;
  italic: () => void;
  inlineCode: () => void;
  header: () => void;
  bulletList: () => void;
  numberedList: () => void;
  link: () => void;
  quote: () => void;
  codeBlock: () => void;
  image: () => void;
  horizontalRule: () => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  getData: () => string;
  setContent: (content: string) => void;
  insertText: (text: string) => void;

  focus: () => void;

  triggerDownload: () => void;
}

const MarkdownEditor = forwardRef<MarkdownEditorRef, MarkdownEditorProps>(
  (
    {
      initialValue = "",
      onDataChange,
      downloadFilename = "document.md",
      className,
    },
    ref,
  ) => {
    const theme = useTheme();
    const [markdown, setMarkdown] = useState(
      initialValue || CONFIG.DEFAULT_MARKDOWN_CONTENT,
    );
    const [activeTab, setActiveTab] = useState(0);
    const textFieldRef = useRef<HTMLTextAreaElement>(null);

    const [history, setHistory] = useState<string[]>([
      initialValue || CONFIG.DEFAULT_MARKDOWN_CONTENT,
    ]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const historyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getData = useCallback(() => {
      return markdown;
    }, [markdown]);

    const triggerDownload = useCallback(() => {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, [markdown, downloadFilename]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    };

    useEffect(() => {
      if (onDataChange) {
        onDataChange(markdown);
      }
    }, [markdown, onDataChange]);

    const updateHistory = useCallback(
      (newMarkdown: string) => {
        if (historyTimeoutRef.current) {
          clearTimeout(historyTimeoutRef.current);
        }

        historyTimeoutRef.current = setTimeout(() => {
          setHistory((prev) => {
            const newHistory = prev.slice(0, historyIndex + 1);
            if (newHistory[newHistory.length - 1] !== newMarkdown) {
              newHistory.push(newMarkdown);
              setHistoryIndex(newHistory.length - 1);
              if (newHistory.length > 50) {
                return newHistory.slice(-50);
              }
              return newHistory;
            }
            return prev;
          });
        }, 500);
      },
      [historyIndex],
    );

    const undo = useCallback(() => {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setMarkdown(history[newIndex]);
      }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setMarkdown(history[newIndex]);
      }
    }, [history, historyIndex]);

    const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
    const canRedo = useCallback(
      () => historyIndex < history.length - 1,
      [historyIndex, history.length],
    );

    useEffect(() => {
      if (markdown !== history[historyIndex]) {
        updateHistory(markdown);
      }
    }, [markdown, updateHistory, history, historyIndex]);

    const insertMarkdown = useCallback(
      (actionFn: MarkdownAction["action"]) => {
        const textarea = textFieldRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = markdown.substring(start, end);

        const result = actionFn(selectedText, { start, end });

        setMarkdown(
          (prev) =>
            prev.substring(0, start) + result.text + prev.substring(end),
        );

        const newCursorPosition = start + result.cursor;

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
      },
      [markdown],
    );

    const markdownActions: MarkdownAction[] = useMemo(
      () => [
        {
          icon: <TextB size={16} />,
          label: "Bold",
          action: (text) => {
            if (text) {
              return { text: `**${text}**`, cursor: text.length + 4 };
            }
            return { text: `****`, cursor: 2 };
          },
        },
        {
          icon: <TextItalic size={16} />,
          label: "Italic",
          action: (text) => {
            if (text) {
              return { text: `*${text}*`, cursor: text.length + 2 };
            }
            return { text: `**`, cursor: 1 };
          },
        },
        {
          icon: <Code size={16} />,
          label: "Inline Code",
          action: (text) => {
            if (text) {
              return { text: `\`${text}\``, cursor: text.length + 2 };
            }
            return { text: `\`code\``, cursor: 5 };
          },
        },
        {
          icon: <Hash size={16} />,
          label: "Header",
          action: (text, selection) => {
            const lines = text.split("\n");
            const processedLines = lines.map((line) => {
              if (line.startsWith("# ")) return line;
              return `# ${line || "Header"}`;
            });
            const result = processedLines.join("\n");
            return { text: result, cursor: result.length };
          },
        },
        {
          icon: <ListBullets size={16} />,
          label: "Bullet List",
          action: (text) => {
            if (text) {
              const lines = text.split("\n");
              const listItems = lines.map((line) =>
                line.trim() ? `- ${line.trim()}` : line,
              );
              const result = listItems.join("\n");
              return { text: result, cursor: result.length };
            }
            return { text: `- List item`, cursor: 11 };
          },
        },
        {
          icon: <ListNumbers size={16} />,
          label: "Numbered List",
          action: (text) => {
            if (text) {
              const lines = text.split("\n");
              const listItems = lines.map((line, index) =>
                line.trim() ? `${index + 1}. ${line.trim()}` : line,
              );
              const result = listItems.join("\n");
              return { text: result, cursor: result.length };
            }
            return { text: `1. List item`, cursor: 12 };
          },
        },
        {
          icon: <Link size={16} />,
          label: "Link",
          action: (text) => {
            if (text) {
              return { text: `[${text}](url)`, cursor: text.length + 3 };
            }
            return { text: `[link text](url)`, cursor: 1 };
          },
        },
        {
          icon: <Quotes size={16} />,
          label: "Quote",
          action: (text) => {
            if (text) {
              const lines = text.split("\n");
              const quotedLines = lines.map((line) => `> ${line}`);
              const result = quotedLines.join("\n");
              return { text: result, cursor: result.length };
            }
            return { text: `> Quote`, cursor: 7 };
          },
        },
        {
          icon: <CodeBlock size={16} />,
          label: "Code Block",
          action: (text) => {
            if (text) {
              const result = `\`\`\`\n${text}\n\`\`\``;
              return { text: result, cursor: result.length };
            }
            return { text: `\`\`\`\ncode block\n\`\`\``, cursor: 4 };
          },
        },
        {
          icon: <Image size={16} />,
          label: "Image",
          action: (text) => {
            if (text) {
              return { text: `![${text}](image-url)`, cursor: text.length + 4 };
            }
            return { text: `![alt text](image-url)`, cursor: 2 };
          },
        },
        {
          icon: <Minus size={16} />,
          label: "Horizontal Rule",
          action: () => {
            return { text: `\n---\n`, cursor: 5 };
          },
        },
      ],
      [],
    );

    useImperativeHandle(
      ref,
      () => ({
        bold: () => insertMarkdown(markdownActions[0].action),
        italic: () => insertMarkdown(markdownActions[1].action),
        inlineCode: () => insertMarkdown(markdownActions[2].action),
        header: () => insertMarkdown(markdownActions[3].action),
        bulletList: () => insertMarkdown(markdownActions[4].action),
        numberedList: () => insertMarkdown(markdownActions[5].action),
        link: () => insertMarkdown(markdownActions[6].action),
        quote: () => insertMarkdown(markdownActions[7].action),
        codeBlock: () => insertMarkdown(markdownActions[8].action),
        image: () => insertMarkdown(markdownActions[9].action),
        horizontalRule: () => insertMarkdown(markdownActions[10].action),

        undo,
        redo,
        canUndo,
        canRedo,

        getData,
        setContent: (content: string) => setMarkdown(content),
        insertText: (text: string) => {
          const textarea = textFieldRef.current;
          if (!textarea) return;

          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          setMarkdown(
            (prev) => prev.substring(0, start) + text + prev.substring(end),
          );

          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + text.length,
              start + text.length,
            );
          }, 0);
        },

        focus: () => {
          textFieldRef.current?.focus();
        },

        triggerDownload,
      }),
      [
        insertMarkdown,
        markdownActions,
        markdown,
        getData,
        triggerDownload,
        undo,
        redo,
        canUndo,
        canRedo,
      ],
    );

    const markdownComponents = createMarkdownComponents(theme);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Tab") {
        event.preventDefault();

        const target = event.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;

        target.value =
          markdown.substring(0, start) + "    " + markdown.substring(end);

        target.selectionStart = target.selectionEnd = start + 4;

        setMarkdown(target.value);
      }
    };
    const PreviewContent = () => (
      <Box
        sx={{
          ...createMarkdownContainerStyles(),
          minHeight: "53.5vh",
          width: "100%",
          height: "fit-content",
          overflow: "auto",
        }}>
        <Markdown
          options={{
            overrides: markdownComponents,
            ...MARKDOWN_OPTIONS,
          }}>
          {markdown}
        </Markdown>
      </Box>
    );

    const tabSx = {
      minHeight: "30px",
      textTransform: "none",
      fontWeight: "medium",
      lineHeight: 0,
      fontSize: "0.875rem",
      "& .MuiTab-iconWrapper": {
        marginRight: "6px",
        marginBottom: "0px !important",
      },
    };

    const MarkdownToolbar = () => (
      <Paper variant="outlined" sx={{ mb: 1 }}>
        <Toolbar variant="dense" sx={{ minHeight: 40, gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={undo}
            disabled={!canUndo()}
            title="Undo"
            sx={{
              borderRadius: 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}>
            <ArrowCounterClockwise size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={redo}
            disabled={!canRedo()}
            title="Redo"
            sx={{
              borderRadius: 1,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}>
            <ArrowClockwise size={16} />
          </IconButton>

          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ mx: 0.5 }}
          />

          {markdownActions.map((action, index) => (
            <IconButton
              key={index}
              size="small"
              onClick={() => insertMarkdown(action.action)}
              title={action.label}
              sx={{
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}>
              {action.icon}
            </IconButton>
          ))}
        </Toolbar>
      </Paper>
    );

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100%",
        }}
        className={className}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab sx={tabSx} icon={<Columns />} />
            <Tab sx={tabSx} icon={<Pen />} />
            <Tab sx={tabSx} icon={<Eye />} />
          </Tabs>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              gap: 1,
            }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={triggerDownload}
              size="small"
              title="Download">
              Download
            </Button>
          </Box>
        </Box>

        {(activeTab === 0 || activeTab === 1) && <MarkdownToolbar />}

        <Box sx={{ flexGrow: 1, overflow: "scroll", maxHeight: "100%" }}>
          {activeTab === 0 && (
            <Grid container sx={{ height: "100%" }} spacing={1}>
              <Grid
                size={6}
                sx={{ height: "100%", overflow: "auto" }}
                component={Card}>
                <TextField
                  multiline
                  fullWidth
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Type your markdown here..."
                  variant="outlined"
                  inputRef={textFieldRef}
                  slotProps={{
                    input: {
                      onKeyDown: handleKeyDown,
                      sx: {
                        minHeight: "50vh",
                        "& textarea": {
                          minHeight: "50vh",
                          overflow: "auto !important",
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          lineHeight: 1.5,
                        },
                      },
                    },
                  }}
                  sx={{
                    minHeight: "50vh",
                    "& .MuiOutlinedInput-root": {
                      minHeight: "50vh",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  }}
                />
              </Grid>

              <Grid
                component={Card}
                size={"grow"}
                sx={{
                  width: "auto",
                  height: "100%",
                  overflow: "auto",
                  padding: 2,
                }}>
                <PreviewContent />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <TextField
              multiline
              fullWidth
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
              variant="outlined"
              inputRef={textFieldRef}
              slotProps={{
                input: {
                  onKeyDown: handleKeyDown,
                  sx: {
                    minHeight: "50vh",
                    "& textarea": {
                      overflow: "auto !important",
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      minHeight: "50vh",
                    },
                  },
                },
              }}
              sx={{
                minHeight: "50vh",
                "& .MuiOutlinedInput-root": {
                  minHeight: "50vh",
                },
              }}
            />
          )}

          {activeTab === 2 && (
            <Card sx={{ overflow: "auto", padding: 2 }}>
              <PreviewContent />
            </Card>
          )}
        </Box>
      </Box>
    );
  },
);

MarkdownEditor.displayName = "MarkdownEditor";

export default MarkdownEditor;
