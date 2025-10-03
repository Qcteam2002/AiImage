# Product Analysis Components

This directory contains the refactored components for the Product Analysis Detail Page, organized for better maintainability and code reusability.

## Design System

### Typography (`../design-system/Typography.tsx`)
- **H1-H6**: Consistent heading styles
- **Body, BodySmall, Caption**: Text content styles
- **Label, LabelSmall**: Form labels and section headers
- **Metric, MetricSmall**: Numbers and statistics
- **Badge**: Status indicators with variants (default, success, warning, error, info)

### Spacing (`../design-system/Spacing.tsx`)
- **Section spacing**: `section`, `sectionLarge`
- **Card spacing**: `cardPadding`, `cardPaddingLarge`
- **Grid spacing**: `gridGap`, `gridGapSmall`, `gridGapLarge`
- **Element spacing**: `element`, `elementSmall`, `elementLarge`

## Components

### 1. ProductHeader
- **Purpose**: Product title, metadata, and action buttons
- **Features**: Back navigation, credit display, download/share actions
- **Props**: `product`, `user`, `onBack`, `onDownload`

### 2. ProductOverview
- **Purpose**: Product images and key market metrics
- **Features**: Image gallery, market size, growth rate, trend change
- **Props**: `product`, `analysisResult`

### 3. ExecutiveSummary
- **Purpose**: High-level analysis summary
- **Features**: Recommendation, opportunities, risks, key points
- **Props**: `analysisResult`

### 4. MarketAnalysis
- **Purpose**: Market data and keyword analysis
- **Features**: Sales potential, Google trends, marketplace data, keyword charts
- **Props**: `analysisResult`

### 5. ProductProblems
- **Purpose**: Product problem analysis
- **Features**: Resolved/unresolved problems with charts
- **Props**: `analysisResult`

### 6. TargetCustomers
- **Purpose**: Customer segmentation analysis
- **Features**: Market share distribution, customer groups, detailed analysis
- **Props**: `analysisResult`

## Usage

```tsx
import ProductHeader from '../components/ProductAnalysis/ProductHeader';
import ProductOverview from '../components/ProductAnalysis/ProductOverview';
// ... other components

// Use in your page
<ProductHeader product={product} user={user} onBack={handleBack} onDownload={handleDownload} />
<ProductOverview product={product} analysisResult={analysisResult} />
```

## Benefits

1. **Maintainability**: Each component has a single responsibility
2. **Reusability**: Components can be used in other parts of the app
3. **Consistency**: Design system ensures uniform styling
4. **Performance**: Smaller components load faster
5. **Testing**: Easier to write unit tests for individual components
6. **Code Organization**: Clear file structure and naming conventions

## Migration

The old monolithic `ProductAnalysisAffDetailPage.tsx` has been:
- **Backed up** as `ProductAnalysisAffDetailPageBackup.tsx`
- **Replaced** with `ProductAnalysisAffDetailPageNew.tsx` that uses the new components
- **Exported** from the main file for seamless integration
