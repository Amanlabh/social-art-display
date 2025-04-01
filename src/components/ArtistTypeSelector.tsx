import { useState } from "react";
import { Music, Theater, Brush, Mic, PenTool } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ArtistTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Predefined artist types with icons
const artistTypes = [
  { value: "musician", label: "Musician", icon: <Music className="h-4 w-4" /> },
  { value: "actor", label: "Theater/Actor", icon: <Theater className="h-4 w-4" /> },
  { value: "painter", label: "Painter/Visual Artist", icon: <Brush className="h-4 w-4" /> },
  { value: "comedian", label: "Comedian", icon: <Mic className="h-4 w-4" /> },
  { value: "writer", label: "Writer", icon: <PenTool className="h-4 w-4" /> },
  { value: "custom", label: "Custom...", icon: null },
];

export function ArtistTypeSelector({ value, onChange }: ArtistTypeSelectorProps) {
  const [customType, setCustomType] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustom(true);
      // Keep the current value until custom is entered
    } else {
      setIsCustom(false);
      onChange(selectedValue);
    }
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomType(e.target.value);
    onChange(e.target.value);
  };

  // Find the currently selected predefined type
  const selectedType = artistTypes.find(type => type.value === value);

  return (
    <div className="space-y-3">
      <Select 
        value={isCustom ? "custom" : value} 
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full border-purple-200 focus-visible:ring-purple-500">
          <SelectValue placeholder="Select artist type">
            {selectedType ? (
              <div className="flex items-center gap-2">
                {selectedType.icon}
                <span>{selectedType.label}</span>
              </div>
            ) : isCustom ? (
              "Custom Artist Type"
            ) : (
              "Select artist type"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {artistTypes.map((type) => (
            <SelectItem 
              key={type.value} 
              value={type.value}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {type.icon}
                <span>{type.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isCustom && (
        <Input
          value={customType}
          onChange={handleCustomChange}
          placeholder="Enter your artist specialty..."
          className="mt-2 border-purple-200 focus-visible:ring-purple-500"
        />
      )}
    </div>
  );
}
