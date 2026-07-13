import React, { useState } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export const SharedChecklist = ({
  title,
  subtitle,
  iconPath,
  fileName,
  initialItems,
}: {
  title: string;
  subtitle: string;
  iconPath: string;
  fileName: string;
  initialItems: any[];
}) => {
  const [checklist, setChecklist] = useState(initialItems);

  const handleToggle = (id: number) => {
    setChecklist((prevChecklist) => {
      const nextChecklist = [...prevChecklist];
      const toggledIndex = nextChecklist.findIndex((item) => item.id === id);

      if (toggledIndex === -1) return prevChecklist;

      const toggledItem = nextChecklist[toggledIndex];
      const newCheckedState = !toggledItem.checked;

      // 1. Update the toggled item itself
      nextChecklist[toggledIndex] = {
        ...toggledItem,
        checked: newCheckedState,
      };

      // 2. Hierarchical logic
      if (!toggledItem.isSubtask) {
        // PARENT TOGGLED: Update all its immediate subtasks to match the parent's new state
        for (let i = toggledIndex + 1; i < nextChecklist.length; i++) {
          if (!nextChecklist[i].isSubtask) break; // Stop when hitting the next parent
          nextChecklist[i] = { ...nextChecklist[i], checked: newCheckedState };
        }
      } else {
        // SUBTASK TOGGLED: Find parent and evaluate if all siblings are checked
        let parentIndex = -1;
        for (let i = toggledIndex - 1; i >= 0; i--) {
          if (!nextChecklist[i].isSubtask) {
            parentIndex = i;
            break;
          }
        }

        if (parentIndex !== -1) {
          let allSubtasksChecked = true;
          for (let i = parentIndex + 1; i < nextChecklist.length; i++) {
            if (!nextChecklist[i].isSubtask) break;
            if (!nextChecklist[i].checked) {
              allSubtasksChecked = false;
              break;
            }
          }
          // Update the parent's checked state based on its subtasks
          nextChecklist[parentIndex] = {
            ...nextChecklist[parentIndex],
            checked: allSubtasksChecked,
          };
        }
      }

      return nextChecklist;
    });
  };

  // Function to dynamically generate and download the checklist as a text file
  const handleDownloadChecklist = async () => {
    const children = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
      }),
      new Paragraph({
        text: subtitle,
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 400 },
      }),
    ];

    checklist.forEach((item) => {
      const isPhase = !item.isSubtask && item.text.includes("Phase");

      // BULLETPROOF INDENT: 8 Non-Breaking Spaces for Subtasks.
      // This forces Google Docs, Apple Pages, and MS Word to respect the indent visually.
      const hardIndent = item.isSubtask
        ? "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
        : "";

      children.push(
        new Paragraph({
          // Keep the native programmatic indent for pure MS Word compatibility
          indent: { left: item.isSubtask ? 720 : 0 },
          spacing: { before: isPhase ? 240 : 60, after: 60 },
          children: [
            new TextRun({
              text: `${hardIndent}${item.checked ? "☑" : "☐"} `,
              size: 28,
            }),
            new TextRun({
              text: item.text,
              bold: isPhase,
              size: 24,
            }),
          ],
        }),
      );
    });

    const doc = new Document({
      sections: [{ properties: {}, children: children }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const finalFileName = fileName.endsWith(".docx")
      ? fileName
      : `${fileName.split(".")[0]}.docx`;

    link.href = url;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // Calculate Progress
  const completedItems = checklist.filter((item) => item.checked).length;
  const progressPercentage = Math.round(
    (completedItems / checklist.length) * 100,
  );

  return (
    <div className="p-8 bg-card rounded-[var(--radius-lg)] shadow-lg border border-border">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <svg
              className="w-4 h-4 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={iconPath}
              />
            </svg>
            <p className="text-muted-foreground font-medium uppercase tracking-wider text-xs">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadChecklist}
          className="flex text-sm items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-[var(--radius-md)] shadow-sm transition-all duration-200 active:scale-95"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download List
        </button>
      </div>

      {/* Progress Bar Area */}
      <div className="mb-8 bg-background p-5 rounded-[var(--radius-md)] border border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-secondary-foreground">
            Journey Progress
          </span>
          <span className="text-sm font-bold text-primary">
            {progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Checklist Area */}
      <div className="bg-background rounded-[var(--radius-lg)] p-2 sm:p-4 border border-border shadow-sm">
        <ul className="space-y-1">
          {checklist.map((item) => (
            <li key={item.id} className={item.isSubtask ? "ml-8" : ""}>
              <label
                htmlFor={`check-${item.id}`}
                className={`flex items-center p-3 rounded-[var(--radius-md)] cursor-pointer transition-all duration-200 group border ${
                  item.checked
                    ? "bg-muted/30 border-transparent"
                    : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border"
                }`}
              >
                <div className="relative flex items-center justify-center shrink-0">
                  <input
                    type="checkbox"
                    id={`check-${item.id}`}
                    checked={item.checked}
                    onChange={() => handleToggle(item.id)}
                    className="peer sr-only"
                  />
                  <div className="w-4 h-4 border-2 border-border rounded-[var(--radius-sm)] bg-background flex items-center justify-center transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/50">
                    {item.checked && (
                      <svg
                        className="w-4 h-4 text-primary-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                <span
                  className={`ml-4 font-medium transition-all duration-200 select-none text-sm ${
                    item.checked
                      ? "text-muted-foreground line-through"
                      : "text-foreground group-hover:text-primary"
                  } ${!item.isSubtask && item.text.includes("Phase") ? "font-bold text-primary" : ""}`}
                >
                  {item.text}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
