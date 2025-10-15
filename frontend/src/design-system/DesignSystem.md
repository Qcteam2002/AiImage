# Design System - AI Image Processing App (Shopify Polaris Based)

## 🎨 Color Palette (Polaris Standard)

### Brand Colors
- **Primary**: `#212326` (Polaris Dark Gray)
- **Primary Hover**: `#1A1C1E` (Polaris Dark Gray Hover)
- **Primary Light**: `#F6F6F7` (Polaris Light Gray)
- **Primary Dark**: `#0A0B0C` (Polaris Darker Gray)

### Semantic Colors
- **Info**: `#0969DA` (Polaris Blue)
- **Info Hover**: `#0860CA` (Polaris Blue Dark)
- **Info Light**: `#E7F3FF` (Polaris Blue Light)

- **Success**: `#008060` (Polaris Green)
- **Success Hover**: `#006B52` (Polaris Green Dark)
- **Success Light**: `#E3F2ED` (Polaris Green Light)

- **Warning**: `#F79009` (Polaris Orange)
- **Warning Hover**: `#DC6803` (Polaris Orange Dark)
- **Warning Light**: `#FEF3E2` (Polaris Orange Light)

- **Critical**: `#D72C0D` (Polaris Red)
- **Critical Hover**: `#B71C0C` (Polaris Red Dark)
- **Critical Light**: `#FEF2F2` (Polaris Red Light)

### Neutral Colors (Polaris Gray Scale)
- **Text Primary**: `#202223` (Polaris Text Primary)
- **Text Secondary**: `#6D7175` (Polaris Text Secondary)
- **Text Muted**: `#8C9196` (Polaris Text Muted)
- **Text Disabled**: `#BABEC3` (Polaris Text Disabled)

- **Background**: `#FFFFFF` (Polaris Background)
- **Background Secondary**: `#F6F6F7` (Polaris Background Secondary)
- **Background Tertiary**: `#F1F2F3` (Polaris Background Tertiary)

- **Border**: `#D1D3D4` (Polaris Border)
- **Border Light**: `#E1E3E5` (Polaris Border Light)
- **Border Strong**: `#8C9196` (Polaris Border Strong)

### Interactive Colors
- **Interactive**: `#212326` (Polaris Interactive)
- **Interactive Hover**: `#1A1C1E` (Polaris Interactive Hover)
- **Interactive Pressed**: `#0A0B0C` (Polaris Interactive Pressed)
- **Interactive Disabled**: `#BABEC3` (Polaris Interactive Disabled)

## 📝 Typography (Polaris Standard)

### Font Family
- **Primary**: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`
- **Monospace**: `'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace`

### Font Sizes (Polaris Scale)
- **Display Large**: `2.5rem` (40px) - `text-4xl` - Line height: 1.2
- **Display Medium**: `2rem` (32px) - `text-3xl` - Line height: 1.25
- **Display Small**: `1.75rem` (28px) - `text-2xl` - Line height: 1.3
- **Heading Large**: `1.5rem` (24px) - `text-2xl` - Line height: 1.3
- **Heading Medium**: `1.25rem` (20px) - `text-xl` - Line height: 1.4
- **Heading Small**: `1.125rem` (18px) - `text-lg` - Line height: 1.4
- **Body Large**: `1rem` (16px) - `text-base` - Line height: 1.5
- **Body Medium**: `0.875rem` (14px) - `text-sm` - Line height: 1.5
- **Body Small**: `0.75rem` (12px) - `text-xs` - Line height: 1.5
- **Caption**: `0.6875rem` (11px) - `text-xs` - Line height: 1.4

### Font Weights (Polaris Standard)
- **Regular**: `400` - `font-normal`
- **Medium**: `500` - `font-medium`
- **Semibold**: `600` - `font-semibold`
- **Bold**: `700` - `font-bold`

### Text Colors (Polaris Semantic)
- **Text Primary**: `#212326` - Main text content
- **Text Secondary**: `#6D7175` - Secondary information
- **Text Muted**: `#8C9196` - Less important text
- **Text Disabled**: `#BABEC3` - Disabled text
- **Text Interactive**: `#212326` - Links and interactive elements
- **Text Critical**: `#D72C0D` - Error messages
- **Text Warning**: `#F79009` - Warning messages
- **Text Success**: `#008060` - Success messages

## 🔘 Button Styles (Polaris Standard)

### Primary Button
```css
.btn-primary {
  @apply bg-[#212326] hover:bg-[#1A1C1E] active:bg-[#0A0B0C] text-white font-medium px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#212326] focus:ring-offset-2 disabled:bg-[#BABEC3] disabled:cursor-not-allowed;
}
```

### Secondary Button
```css
.btn-secondary {
  @apply bg-white hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] border border-[#D1D3D4] font-medium px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#212326] focus:ring-offset-2 disabled:bg-[#F6F6F7] disabled:text-[#BABEC3] disabled:cursor-not-allowed;
}
```

### Tertiary Button
```css
.btn-tertiary {
  @apply bg-transparent hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] font-medium px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#212326] focus:ring-offset-2 disabled:text-[#BABEC3] disabled:cursor-not-allowed;
}
```

### Destructive Button
```css
.btn-destructive {
  @apply bg-[#D72C0D] hover:bg-[#B71C0C] active:bg-[#9A1A0A] text-white font-medium px-4 py-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#D72C0D] focus:ring-offset-2 disabled:bg-[#BABEC3] disabled:cursor-not-allowed;
}
```

### Plain Button
```css
.btn-plain {
  @apply bg-transparent hover:bg-[#F6F6F7] active:bg-[#F1F2F3] text-[#212326] font-medium px-2 py-1 rounded transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#212326] focus:ring-offset-2 disabled:text-[#BABEC3] disabled:cursor-not-allowed;
}
```

### Button Sizes (Polaris Standard)
- **Small**: `px-3 py-1.5 text-xs h-7` (28px height)
- **Medium**: `px-4 py-2 text-sm h-8` (32px height)
- **Large**: `px-4 py-2.5 text-sm h-9` (36px height)
- **Extra Large**: `px-5 py-3 text-sm h-10` (40px height)

### Button States
- **Default**: Normal appearance
- **Hover**: Slightly darker background
- **Active**: Pressed state with darker background
- **Focus**: Ring outline for accessibility
- **Disabled**: Grayed out with reduced opacity
- **Loading**: Spinner with disabled interaction

## 📊 Table Styles (Polaris Standard)

### Table Container
```css
.table-container {
  @apply bg-white rounded-lg border border-[#D1D3D4] overflow-hidden;
}
```

### Table Header
```css
.table-header {
  @apply bg-[#F6F6F7] border-b border-[#D1D3D4];
}
```

### Table Cell
```css
.table-cell {
  @apply px-4 py-3 text-sm text-[#212326] border-b border-[#E1E3E5];
}
```

### Table Cell Header
```css
.table-cell-header {
  @apply px-4 py-3 text-left text-xs font-medium text-[#6D7175] uppercase tracking-wider;
}
```

### Table Row States
```css
.table-row-hover {
  @apply hover:bg-[#F6F6F7] transition-colors duration-150;
}

.table-row-selected {
  @apply bg-[#E3F2ED] border-l-4 border-l-[#008060];
}
```

## 🎯 Component Guidelines

### Cards
- **Border Radius**: `rounded-lg` (8px)
- **Shadow**: `shadow-sm` hoặc `shadow-md`
- **Padding**: `p-6` cho content, `p-4` cho compact
- **Background**: `bg-white`

### Forms
- **Input**: `border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- **Label**: `text-sm font-medium text-gray-700 mb-1`
- **Error**: `text-sm text-red-600 mt-1`

### Modals
- **Backdrop**: `bg-black bg-opacity-50`
- **Container**: `bg-white rounded-lg shadow-xl max-w-4xl mx-auto`
- **Header**: `px-6 py-4 border-b border-gray-200`
- **Body**: `px-6 py-4`
- **Footer**: `px-6 py-4 border-t border-gray-200 bg-gray-50`

## 🌐 Internationalization

### Supported Languages
- **Vietnamese (vi)**: Ngôn ngữ mặc định
- **English (en)**: Ngôn ngữ thứ hai

### Translation Keys Structure
```
{
  "common": {
    "actions": {
      "create": "Tạo mới",
      "edit": "Chỉnh sửa", 
      "delete": "Xóa",
      "save": "Lưu",
      "cancel": "Hủy",
      "close": "Đóng",
      "search": "Tìm kiếm",
      "filter": "Lọc",
      "export": "Xuất file"
    },
    "status": {
      "active": "Hoạt động",
      "inactive": "Không hoạt động",
      "pending": "Đang chờ",
      "completed": "Hoàn thành"
    }
  },
  "pages": {
    "productDiscovery": {
      "title": "Khám Phá Sản Phẩm",
      "subtitle": "Tìm kiếm cơ hội kinh doanh mới",
      "actions": {
        "startDiscovery": "Bắt đầu khám phá",
        "testStructure": "Test cấu trúc"
      }
    }
  }
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: `< 640px` (sm)
- **Tablet**: `640px - 1024px` (md, lg)
- **Desktop**: `> 1024px` (xl, 2xl)

### Grid System
- **Mobile**: 1 column
- **Tablet**: 2-3 columns
- **Desktop**: 3-4 columns

## ✅ Usage Rules

1. **ALWAYS** sử dụng Typography component thay vì hardcode classes
2. **ALWAYS** sử dụng Button component với variant phù hợp
3. **ALWAYS** sử dụng translation keys thay vì hardcode text
4. **ALWAYS** sử dụng table layout cho listing pages
5. **ALWAYS** follow color palette và spacing guidelines
6. **NEVER** sử dụng arbitrary colors hoặc sizes
7. **NEVER** hardcode text content
8. **NEVER** tạo custom button styles ngoài design system
