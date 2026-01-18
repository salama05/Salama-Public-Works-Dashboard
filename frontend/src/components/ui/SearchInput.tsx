import React from 'react';
import { Search } from 'lucide-react';
import Input from './Input';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchInput = ({ value, onChange, placeholder = "بحث...", className, ...props }: SearchInputProps) => {
    return (
        <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`pr-10 ${className}`}
                {...props}
            />
        </div>
    );
};

export default SearchInput;
