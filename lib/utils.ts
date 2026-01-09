/**
 * ISO 8601 日付文字列を日本語形式にフォーマット
 * @param dateString - ISO 8601 形式の日付文字列
 * @returns フォーマットされた日付文字列（例: "2026年1月9日"）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}年${month}月${day}日`;
}

/**
 * ISO 8601 日付文字列を相対時間にフォーマット
 * @param dateString - ISO 8601 形式の日付文字列
 * @returns 相対時間（例: "3日前"）
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "今日";
  } else if (diffDays === 1) {
    return "昨日";
  } else if (diffDays < 7) {
    return `${diffDays}日前`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}週間前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}ヶ月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}年前`;
  }
}

/**
 * テキストを指定文字数で切り詰める
 * @param text - 元のテキスト
 * @param maxLength - 最大文字数
 * @returns 切り詰められたテキスト
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
}
