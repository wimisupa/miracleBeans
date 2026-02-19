'use client'

import React, { useRef, useState, useEffect } from 'react'

interface PinInputProps {
    length?: number
    onComplete: (pin: string) => void
    disabled?: boolean
}

export default function PinInput({ length = 4, onComplete, disabled = false }: PinInputProps) {
    const [values, setValues] = useState<string[]>(Array(length).fill(''))
    const inputsRef = useRef<(HTMLInputElement | null)[]>([])

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return

        const newValues = [...values]
        newValues[index] = value.slice(-1) // Take only the last character
        setValues(newValues)

        // Move to next input if value entered
        if (value && index < length - 1) {
            inputsRef.current[index + 1]?.focus()
        }

        // Check completion
        if (newValues.every(v => v !== '') && index === length - 1 && value) {
            onComplete(newValues.join(''))
        } else if (newValues.every(v => v !== '')) {
            onComplete(newValues.join(''))
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !values[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputsRef.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, length).split('')
        if (pastedData.every(char => /^\d$/.test(char))) {
            const newValues = Array(length).fill('')
            pastedData.forEach((char, i) => newValues[i] = char)
            setValues(newValues)
            if (newValues.every(v => v !== '')) {
                onComplete(newValues.join(''))
                inputsRef.current[length - 1]?.focus()
            }
        }
    }

    return (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={el => { inputsRef.current[i] = el }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={values[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    style={{
                        width: '50px',
                        height: '60px',
                        fontSize: '24px',
                        textAlign: 'center',
                        borderRadius: '12px',
                        border: '2px solid #E0E0E0',
                        outline: 'none',
                        background: 'white',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={e => e.target.style.borderColor = '#E0E0E0'}
                />
            ))}
        </div>
    )
}
