# LoadingSpinner Component

A reusable loading spinner component with animated SVG icons, designed to replace all loading states throughout the booking app.

## Features

- 🎨 **Custom SVG Animation**: Uses the provided house-themed SVG with smooth animations
- 📏 **Multiple Sizes**: Small, medium (default), and large size variants
- 🎯 **Customizable Text**: Optional loading text with Vietnamese language support
- 📱 **Responsive Design**: Adapts to different screen sizes
- 🎭 **No Background**: Transparent background for seamless integration

## Usage

### Basic Usage
```tsx
import LoadingSpinner from './components/LoadingSpinner';

// Default medium size with no text
<LoadingSpinner />

// With custom text
<LoadingSpinner text="Đang tải dữ liệu..." />

// Different sizes
<LoadingSpinner size="small" text="Loading..." />
<LoadingSpinner size="large" text="Please wait..." />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the spinner |
| `text` | `string` | `undefined` | Optional loading text to display |

### Size Variants

- **Small**: 40px × 40px (mobile-friendly)
- **Medium**: 80px × 80px (default, desktop-optimized)
- **Large**: 120px × 120px (prominent display)

### Implementation Examples

#### Page Loading
```tsx
if (loading) {
  return (
    <div className={styles.page}>
      <Header />
      <LoadingSpinner text="Đang tải dữ liệu..." />
    </div>
  );
}
```

#### Component Loading
```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

return (
  <button 
    onClick={handleSubmit}
    disabled={isSubmitting}
  >
    {isSubmitting ? (
      <LoadingSpinner size="small" text="Đang xử lý..." />
    ) : (
      'Submit'
    )}
  </button>
);
```

## Design

The component uses a house-themed SVG animation that represents the booking app's focus on home rentals. The animation includes:

- **House outline**: Red (#ff566b) - represents available/booked status
- **House interior**: Light pink (#ebafb0) - represents selected status
- **Smooth scaling animation**: Creates a pulsing effect

## CSS Classes

- `.loadingContainer`: Main container with flex layout
- `.spinner`: Spinner wrapper
- `.svg`: SVG element styling
- `.ldlScale`: Animation container
- `.ldlAni`: Animated elements
- `.loadingText`: Text styling
- `.small`, `.medium`, `.large`: Size variants

## Responsive Behavior

- **Desktop**: Full-size spinners with optimal visibility
- **Tablet**: Slightly reduced sizes for better fit
- **Mobile**: Compact sizes with adjusted text sizing

## Migration from Old Loading

The component replaces the old CSS-based loading spinners that used:
- CSS pseudo-elements (`::after`)
- Border-based spinning animations
- Fixed color schemes

Benefits of the new approach:
- ✅ Consistent visual design across the app
- ✅ Better accessibility with semantic SVG
- ✅ Easier customization and maintenance
- ✅ Improved performance (no CSS animations)
- ✅ Better mobile experience

## Files Updated

The following files were updated to use the new LoadingSpinner:

- `src/app/page.tsx` - Main page loading
- `src/app/admin/page.tsx` - Admin page loading
- `src/app/payment/page.tsx` - Payment page loading
- `src/app/rooms/[roomSlug]/page.tsx` - Room detail loading
- `src/app/branches/[branchSlug]/page.tsx` - Branch detail loading

Old loading CSS styles were removed from:
- `src/app/page.module.css`
- `src/app/admin/admin.module.css`
- `src/app/payment/payment.module.css` 