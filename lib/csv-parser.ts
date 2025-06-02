// ============================================================================
// Type Definitions
// ============================================================================

/** Represents a single row of CSV data as key-value pairs */
export interface CSVRow {
  [key: string]: string;
}

/** Result of CSV parsing operation */
export interface CSVParseResult {
  headers: string[];           // Column headers from first row
  data: CSVRow[];             // Parsed data rows
  columnTypes: Record<string, string>; // Detected data types per column
}

/** Error thrown during CSV parsing */
export interface CSVParseError {
  message: string;
}

// ============================================================================
// Main Parser Function
// ============================================================================

/**
 * Parse CSV text into structured data with automatic format detection
 * 
 * @param csvText - Raw CSV text content
 * @returns Parsed CSV data with headers, rows, and column types
 * @throws Error if CSV is empty or contains no valid data
 */

export function parseCSV(csvText: string): CSVParseResult {
  // Step 1: Normalize the input text
  const normalizedText = normalizeCSVText(csvText);
  
  // Step 2: Auto-detect the delimiter used in this CSV
  const delimiter = detectDelimiter(normalizedText);

  // Step 3: Split text into lines while respecting quoted content
  const lines = splitCSVLines(normalizedText);
  
  if (lines.length === 0) {
    throw new Error('CSV 檔案沒有有效行');
  }

  // Step 4: Parse the header row
  const headers = parseCSVLine(lines[0], delimiter);
  
  // Step 5: Parse data rows and build structured objects
  const data = parseDataRows(lines.slice(1), headers, delimiter);
  
  if (data.length === 0) {
    throw new Error('解析後沒有有效資料行');
  }

  // Step 6: Analyze columns to detect data types
  const columnTypes = analyzeColumnTypes(data, headers);

  return { headers, data, columnTypes };
}

// ============================================================================
// Text Normalization
// ============================================================================

/**
 * Normalize CSV text by removing BOM and standardizing line endings
 * 
 * @param csvText - Raw CSV text
 * @returns Normalized text ready for parsing
 */
function normalizeCSVText(csvText: string): string {
  if (!csvText) {
    throw new Error('CSV 檔案沒有內容');
  }

  // Remove UTF-8 BOM (Byte Order Mark) if present
  // Common in files exported from Excel
  let text = csvText.charCodeAt(0) === 0xFEFF ? csvText.substring(1) : csvText;
  
  // Normalize different line ending formats to \n
  // Handles Windows (\r\n), old Mac (\r), and Unix (\n)
  text = text.replace(/\r\n?/g, '\n').trim();
  
  if (!text) {
    throw new Error('CSV 檔案沒有內容');
  }

  return text;
}

// ============================================================================
// Delimiter Detection
// ============================================================================

/**
 * Auto-detect the delimiter used in the CSV by analyzing the first line
 * 
 * @param text - Normalized CSV text
 * @returns Most likely delimiter character
 */
function detectDelimiter(text: string): string {
  const firstLine = text.split('\n')[0];
  const delimiters = [',', ';', '\t']; // Common CSV delimiters
  
  let bestDelimiter = ','; // Default fallback
  let maxCount = 0;

  // Count occurrences of each delimiter in the first line
  for (const delimiter of delimiters) {
    const count = firstLine.split(delimiter).length - 1;
    if (count > maxCount) {
      maxCount = count;
      bestDelimiter = delimiter;
    }
  }

  return bestDelimiter;
}

// ============================================================================
// Line Splitting (Quote-Aware)
// ============================================================================

/**
 * Split CSV text into lines while respecting quoted content
 * 
 * This is crucial because CSV fields can contain embedded line breaks
 * when they are enclosed in quotes. We need to track quote state to
 * avoid splitting lines incorrectly.
 * 
 * @param text - Normalized CSV text
 * @returns Array of CSV lines
 */
function splitCSVLines(text: string): string[] {
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      // Handle escaped quotes: "" becomes "
      if (nextChar === '"') {
        currentLine += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state and include the quote in output
        inQuotes = !inQuotes;
        currentLine += char;
      }
    } else if (char === '\n' && !inQuotes) {
      // Only treat as line break if we're not inside quotes
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else {
      currentLine += char;
    }
  }

  // Don't forget the last line if it doesn't end with newline
  if (currentLine.trim()) {
    lines.push(currentLine);
  }

  return lines;
}

// ============================================================================
// Single Line Parsing
// ============================================================================

/**
 * Parse a single CSV line into individual field values
 * 
 * Handles quoted fields correctly, including:
 * - Fields with embedded commas: "Smith, John"
 * - Fields with embedded quotes: "He said ""Hello"""
 * - Mixed quoted and unquoted fields
 * 
 * @param line - Single CSV line
 * @param delimiter - Delimiter character to use
 * @returns Array of field values
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Start or end of quoted field
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field separator (only when not inside quotes)
      values.push(cleanValue(currentValue));
      currentValue = '';
    } else {
      // Regular character
      currentValue += char;
    }
  }

  // Add the final field
  values.push(cleanValue(currentValue));
  return values;
}

// ============================================================================
// Value Cleaning
// ============================================================================

/**
 * Clean and normalize a single CSV field value
 * 
 * @param value - Raw field value
 * @returns Cleaned value
 */
function cleanValue(value: string): string {
  let cleaned = value.trim();
  
  // Remove surrounding quotes if they form a matching pair
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.substring(1, cleaned.length - 1);
  }
  
  // Handle any remaining escaped quotes
  cleaned = cleaned.replace(/""/g, '"');
  
  return cleaned;
}

// ============================================================================
// Data Row Processing
// ============================================================================

/**
 * Parse multiple data rows and convert them to structured objects
 * 
 * @param dataLines - Array of CSV lines (excluding header)
 * @param headers - Column headers
 * @param delimiter - Delimiter character
 * @returns Array of row objects
 */
function parseDataRows(dataLines: string[], headers: string[], delimiter: string): CSVRow[] {
  const data: CSVRow[] = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const values = parseCSVLine(dataLines[i], delimiter);
    
    // Skip malformed rows (wrong number of columns)
    if (values.length !== headers.length) {
      console.warn(`Skipping row ${i + 2} due to column count mismatch: expected ${headers.length}, got ${values.length}`);
      continue;
    }
    
    // Create row object with header-value pairs
    const row: CSVRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }
  
  return data;
}

// ============================================================================
// Column Type Analysis
// ============================================================================

/**
 * Analyze all columns to detect their most likely data types
 * 
 * @param data - Parsed CSV data
 * @param headers - Column headers
 * @returns Object mapping column names to detected types
 */
function analyzeColumnTypes(data: CSVRow[], headers: string[]): Record<string, string> {
  const columnTypes: Record<string, string> = {};
  
  headers.forEach(header => {
    const columnValues = data.map(row => row[header]);
    columnTypes[header] = detectColumnType(columnValues);
  });
  
  return columnTypes;
}

/**
 * Detect the most likely data type for a column based on its values
 * 
 * @param values - Array of string values from a column
 * @returns Detected type: '日期', '數字', or '文字'
 */
function detectColumnType(values: string[]): string {
  let hasNumbers = 0;
  let hasNonNumbers = 0;
  let hasDate = 0;
  
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed) continue; // Skip empty cells
    
    // Check for common date patterns
    if (isDatePattern(trimmed)) {
      hasDate++;
      continue;
    }
    
    // Check if it's a valid number
    if (!isNaN(Number(trimmed)) && trimmed !== '') {
      hasNumbers++;
    } else {
      hasNonNumbers++;
    }
  }
  
  // Determine the predominant type
  if (hasDate > Math.max(hasNumbers, hasNonNumbers)) {
    return '日期';
  } else if (hasNumbers > 0 && hasNonNumbers === 0) {
    return '數字';
  } else {
    return '文字';
  }
}

/**
 * Check if a value matches common date patterns
 * 
 * @param value - String value to check
 * @returns True if it looks like a date
 */
function isDatePattern(value: string): boolean {
  const datePatterns = [
    /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/, // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/, // MM-DD-YYYY, MM/DD/YYYY, MM.DD.YYYY
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2}$/  // MM-DD-YY, MM/DD/YY, MM.DD.YY
  ];
  
  return datePatterns.some(pattern => pattern.test(value));
}
