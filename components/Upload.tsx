import { useState, useRef } from "react";

interface DropDownProps {
  handleFileUpload: (file: File) => void;
}

export default function DropDown({ handleFileUpload }: DropDownProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".jpg, .png, .pdf, .doc, .docx"
      />

      <button
        className="w-full justify-between items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
        onClick={handleButtonClick}
      >
        {selectedFile ? selectedFile.name : "Upload File"}
      </button>
    </div>
  );
}
