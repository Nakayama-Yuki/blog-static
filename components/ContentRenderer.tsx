import React from "react";
import { BlogParagraph } from "@/types/blog";

interface Props {
  paragraphs: BlogParagraph[];
}

/**
 * JSON 段落データを HTML にレンダリングするコンポーネント
 */
export default function ContentRenderer({ paragraphs }: Props) {
  // リストアイテムをグループ化
  const groupedContent: (BlogParagraph | BlogParagraph[])[] = [];
  let currentList: BlogParagraph[] = [];

  for (const para of paragraphs) {
    if (para.type === "list") {
      currentList.push(para);
    } else {
      if (currentList.length > 0) {
        groupedContent.push([...currentList]);
        currentList = [];
      }
      groupedContent.push(para);
    }
  }

  if (currentList.length > 0) {
    groupedContent.push(currentList);
  }

  return (
    <div className="prose prose-lg max-w-none">
      {groupedContent.map((item, idx) => {
        // リストグループの場合
        if (Array.isArray(item)) {
          const isOrdered = item[0]?.ordered;
          const ListTag = isOrdered ? "ol" : "ul";

          return (
            <ListTag key={idx} className="my-4 ml-6 space-y-2">
              {item.map((listItem, listIdx) => (
                <li key={listIdx} className="text-gray-700">
                  {listItem.content}
                </li>
              ))}
            </ListTag>
          );
        }

        // 単一段落の場合
        const para = item;

        switch (para.type) {
          case "heading": {
            const level = para.level || 2;
            const headingClasses = {
              1: "text-4xl font-bold mt-8 mb-4",
              2: "text-3xl font-bold mt-8 mb-4",
              3: "text-2xl font-bold mt-6 mb-3",
              4: "text-xl font-semibold mt-4 mb-2",
              5: "text-lg font-semibold mt-4 mb-2",
              6: "text-base font-semibold mt-4 mb-2",
            };

            return React.createElement(
              `h${level}`,
              {
                key: idx,
                className:
                  headingClasses[level as keyof typeof headingClasses] ||
                  headingClasses[2],
              },
              para.content,
            );
          }

          case "paragraph":
            return (
              <p key={idx} className="mb-4 text-gray-700 leading-relaxed">
                {para.content}
              </p>
            );

          case "code":
            return (
              <pre
                key={idx}
                className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm"
              >
                <code className={`language-${para.language || "text"}`}>
                  {para.content}
                </code>
              </pre>
            );

          case "quote":
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-blue-500 pl-4 py-2 italic text-gray-600 my-4 bg-blue-50"
              >
                {para.content}
              </blockquote>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
