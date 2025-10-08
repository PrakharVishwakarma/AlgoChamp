# Flash Message System Documentation

## Overview
A comprehensive flash message system for the AlgoChamp platform with dark theme styling, animations, and accessibility features.

## Features
- ✅ **Dark Theme Optimized**: Designed for your dark theme interface
- ✅ **Type Safe**: Full TypeScript support with proper types
- ✅ **Animated**: Smooth slide-in/slide-out animations
- ✅ **Accessible**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Manual Dismiss**: Users can close messages with X button
- ✅ **Auto Dismiss**: Configurable auto-removal timeout
- ✅ **Memory Safe**: Proper cleanup of timeouts to prevent memory leaks
- ✅ **Persistent Messages**: Support for messages that don't auto-dismiss
- ✅ **Bulk Operations**: Clear all messages at once

## Usage Examples

### Basic Usage
```tsx
import { useShowFlashMessage } from "@/context/FlashMessageContext";

const MyComponent = () => {
    const showFlashMessage = useShowFlashMessage();

    const handleSuccess = () => {
        showFlashMessage("success", "Operation completed successfully!");
    };

    const handleError = () => {
        showFlashMessage("error", "Something went wrong. Please try again.");
    };

    return (
        <div>
            <button onClick={handleSuccess}>Show Success</button>
            <button onClick={handleError}>Show Error</button>
        </div>
    );
};
```

### Advanced Usage with Custom Duration
```tsx
import { useFlashMessageActions } from "@/context/FlashMessageContext";

const AdvancedComponent = () => {
    const { showFlashMessage, removeFlashMessage, clearAllFlashMessages } = useFlashMessageActions();

    const handleCustomDuration = () => {
        // Show message for 10 seconds
        showFlashMessage("info", "This message will stay for 10 seconds", 10000);
    };

    const handlePersistent = () => {
        // Show message that won't auto-dismiss (duration = 0)
        showFlashMessage("warn", "Manual action required", 0);
    };

    const handleClearAll = () => {
        clearAllFlashMessages();
    };

    return (
        <div>
            <button onClick={handleCustomDuration}>10 Second Message</button>
            <button onClick={handlePersistent}>Persistent Message</button>
            <button onClick={handleClearAll}>Clear All</button>
        </div>
    );
};
```

### Form Validation Example
```tsx
import { useShowFlashMessage } from "@/context/FlashMessageContext";

const LoginForm = () => {
    const showFlashMessage = useShowFlashMessage();

    const handleSubmit = async (formData: FormData) => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                showFlashMessage("success", "Login successful! Welcome back.");
                // Redirect user
            } else {
                showFlashMessage("error", "Invalid credentials. Please try again.");
            }
        } catch (error) {
            showFlashMessage("error", "Network error. Please check your connection.");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* form fields */}
        </form>
    );
};
```

## Message Types
- **success**: Green themed for successful operations
- **error**: Red themed for errors and failures  
- **info**: Blue themed for informational messages
- **warn**: Yellow themed for warnings and cautions

## API Reference

### useShowFlashMessage()
Simple hook for showing flash messages (backward compatibility).
```tsx
const showFlashMessage = useShowFlashMessage();
showFlashMessage(type, message, duration?);
```

### useFlashMessageActions()
Advanced hook with all flash message actions.
```tsx
const { showFlashMessage, removeFlashMessage, clearAllFlashMessages } = useFlashMessageActions();
```

#### Methods:
- `showFlashMessage(type, message, duration?)`: Show a new flash message
- `removeFlashMessage(id)`: Remove a specific message by ID
- `clearAllFlashMessages()`: Remove all messages immediately

### useFlashMessages()
Hook to access the current list of messages (for custom rendering).
```tsx
const messages = useFlashMessages();
```

## Styling Customization
The flash messages use Tailwind classes and can be customized by modifying the `styleMap` in `FlashMessageContainer.tsx`.

Current theme matches your dark interface:
- Background: `bg-gray-800/95` with backdrop blur
- Borders: Colored borders matching message type
- Text: `text-gray-200` for readability
- Icons: Colored to match message type

## Accessibility Features
- ARIA live regions for screen readers
- Keyboard navigation support
- Focus management
- High contrast colors
- Dismissible with keyboard (focus + Enter/Space)

## Performance Considerations
- Automatic cleanup of timeouts prevents memory leaks
- Efficient re-renders with proper React keys
- Smooth animations don't block UI
- Tree-shakable icon imports