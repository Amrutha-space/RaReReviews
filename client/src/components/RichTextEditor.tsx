import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your review here...",
  className,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const handleFormat = (command: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    let newText = "";
    let newActiveFormats = new Set(activeFormats);

    switch (command) {
      case 'bold':
        if (selectedText) {
          newText = `**${selectedText}**`;
          newActiveFormats.add('bold');
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = `*${selectedText}*`;
          newActiveFormats.add('italic');
        }
        break;
      case 'underline':
        if (selectedText) {
          newText = `<u>${selectedText}</u>`;
          newActiveFormats.add('underline');
        }
        break;
      case 'list':
        newText = `\n• ${selectedText || 'List item'}`;
        break;
      case 'orderedList':
        newText = `\n1. ${selectedText || 'List item'}`;
        break;
    }

    if (newText) {
      const newValue = value.substring(0, start) + newText + value.substring(end);
      onChange(newValue);
      
      // Update active formats
      setActiveFormats(newActiveFormats);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + newText.length, start + newText.length);
      }, 0);
    }
  };

  return (
    <div className={cn("border border-gray-300 rounded-lg", className)}>
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('bold')}
            className={cn(
              "p-2",
              activeFormats.has('bold') && "bg-gray-200"
            )}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('italic')}
            className={cn(
              "p-2",
              activeFormats.has('italic') && "bg-gray-200"
            )}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('underline')}
            className={cn(
              "p-2",
              activeFormats.has('underline') && "bg-gray-200"
            )}
          >
            <Underline className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-gray-300"></div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('list')}
            className="p-2"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat('orderedList')}
            className="p-2"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={8}
        className="border-0 rounded-t-none resize-none focus:ring-0"
      />
    </div>
  );
}
