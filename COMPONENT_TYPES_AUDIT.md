# Component Types Audit - Complete Reference

## ✅ **All Component Type Definitions**

### **Button Component**
**File**: `components/ui/button.tsx`
**Supported Variants**:
- `"primary"` - Green accent background
- `"secondary"` - White with border
- `"ghost"` - Transparent with hover
- `"danger"` - Red/danger styling
- `"outline"` - Border with hover (ADDED)

**Supported Sizes**:
- `"sm"` - Small
- `"md"` - Medium (default)
- `"lg"` - Large

### **Badge Component**
**File**: `components/ui/display/badge.tsx`
**Supported Variants**:
- `"success"` - Green (for positive states)
- `"warning"` - Yellow/amber (for caution)
- `"danger"` - Red (for errors/critical)
- `"info"` - Blue (for informational)
- `"neutral"` - Gray (for neutral states)

**❌ NOT SUPPORTED**: `"default"`, `"secondary"`, `"destructive"`, `"primary"`

### **Card Component**
**File**: `components/ui/display/card.tsx`
**Supported Variants**:
- `"default"` - Standard card
- `"accent"` - Card with gold top border
- `"interactive"` - Clickable card with hover effects

**Supported Sizes**:
- `"sm"` - Compact padding
- `"md"` - Standard padding (default)
- `"lg"` - Spacious padding

### **Tabs Component**
**File**: `components/ui/tabs.tsx`
**Components**:
- `Tabs` - Container with context
- `TabsList` - Tab button container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Content panel

## 🔧 **Common Mistakes to Avoid**

### **Badge Variants**
❌ **WRONG**:
```tsx
<Badge variant="default">...</Badge>
<Badge variant="secondary">...</Badge>
<Badge variant="destructive">...</Badge>
```

✅ **CORRECT**:
```tsx
<Badge variant="success">...</Badge>
<Badge variant="warning">...</Badge>
<Badge variant="danger">...</Badge>
```

### **Button Variants**
✅ **ALL SUPPORTED**:
```tsx
<Button variant="primary">...</Button>
<Button variant="secondary">...</Button>
<Button variant="ghost">...</Button>
<Button variant="danger">...</Button>
<Button variant="outline">...</Button>
```

### **Card Variants**
✅ **ALL SUPPORTED**:
```tsx
<Card variant="default">...</Card>
<Card variant="accent">...</Card>
<Card variant="interactive">...</Card>
```

## 📋 **Type Mapping Guide**

### **When to use each Badge variant**:
- **success**: Approved, completed, active, good performance
- **warning**: Pending, in progress, moderate issues
- **danger**: Rejected, failed, critical issues, breached SLA
- **info**: Informational, processing, neutral updates
- **neutral**: Draft, cancelled, expired, default states

### **When to use each Button variant**:
- **primary**: Main actions (Submit, Save, Apply)
- **secondary**: Alternative actions (Cancel, Back)
- **ghost**: Subtle actions (Close, Dismiss)
- **danger**: Destructive actions (Delete, Remove)
- **outline**: Secondary emphasis (Refresh, Filter)

## ✅ **All Issues Fixed**

1. ✅ CardContent export - ADDED
2. ✅ Tabs component - CREATED
3. ✅ Agency type comparison - FIXED
4. ✅ ApplicationStatus type - FIXED
5. ✅ Button outline variant - ADDED
6. ✅ Badge variant types - FIXED

**Build Status**: READY FOR DEPLOYMENT