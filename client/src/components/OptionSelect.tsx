import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@terjeballestad/bob';

export interface SelectOption {
  value: string;
  label: string;
}

interface OptionSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  /** The size class, on the trigger (Bob 1.0: `select-trigger`). */
  className?: string;
  /** FormRow's label names the select by this id; Bob's Select puts it on the trigger. */
  id?: string;
}

/** Bob 1.0's Select (Base UI, DD-036) with Makron's 0.x shape: an options list and the value.
 *  An empty-string value is an item like any other ("— no project"), so the guard tests null.
 *  Base UI also reports a pick of the item that is already chosen; a native select did not, so
 *  onChange skips it, and no save goes out with no change. */
export function OptionSelect({ options, value, onChange, className, id }: OptionSelectProps) {
  return (
    <Select
      items={options}
      value={value}
      id={id}
      onValueChange={(next) => {
        if (next !== null && next !== value) onChange(next);
      }}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
