# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-11-05

### ✨ Added

#### **Suspense for Async Operations** ⏳
Declarative loading states for async components and data fetching
- `<Suspense>` component with customizable fallback UI
- **lazy() API:**
  - Code splitting for components
  - Automatic bundle splitting
  - Integration with build tools
- **createResource() API:**
  - Declarative data fetching
  - Automatic loading state management
  - Promise coordination
- **useSuspensePromise()** - manual promise registration
- **SuspenseList** - coordinate multiple Suspense boundaries (experimental)
- **Features:**
  - Automatic promise tracking
  - Nested Suspense boundaries for granular loading
  - Default animated fallback UI (spinner)
  - Custom fallback support
  - onResolve / onError callbacks
  - Integration with async computed values
  - Works with ErrorBoundary for error handling
- Full integration with reactivity system
- Type-safe API
- Comprehensive documentation (`docs/SUSPENSE.md`)
- Examples:
  - Lazy loading components with code splitting
  - Data fetching with createResource
  - Nested Suspense boundaries
  - Parallel data loading

#### **Error Boundaries** 🛡️
Полноценная система отлова и обработки ошибок в компонентах
- `<ErrorBoundary>` компонент для отлова ошибок в дереве компонентов
- **Props:**
  - `fallback` - кастомный UI при ошибке (функция или Node)
  - `onError` - callback при возникновении ошибки
  - `onReset` - callback при сбросе ErrorBoundary
  - `resetKeys` - автоматический сброс при изменении зависимостей
- `captureError(error, componentStack?)` - программная отправка ошибок
- `useErrorHandler()` - hook для обработки ошибок
- `wrapWithErrorHandling(fn, name?)` - обертка функций для отлова ошибок
- **Возможности:**
  - Graceful degradation - показ fallback UI вместо крашей
  - Вложенные ErrorBoundary для изоляции ошибок
  - Автоматический reset через `resetKeys`
  - Интеграция с jsx-runtime - автоматический отлов ошибок в компонентах
  - Красивый default fallback UI с деталями ошибки
  - Поддержка async ошибок через `captureError`
- Полная интеграция с реактивной системой
- Type-safe API
- Документация (`docs/ERROR_BOUNDARIES.md`)
- Примеры использования в counter-vite

#### **Context API**
Полноценная реализация Context API для передачи данных через дерево компонентов
- `createContext<T>` - создание типизированного контекста
- `provideContext<T>` - предоставление значения для контекста
- `injectContext<T>` - получение значения из контекста
- `createProvider<T>` - создание Provider-компонента
- `hasContext<T>` - проверка наличия контекста
- Автоматическая очистка контекстов при unmount компонентов
- Полная поддержка TypeScript
- Интеграция с реактивной системой (работает с `state`, `computed`, `effect`)

#### **Dependency Injection System** 🎉
Мощная система DI для разделения логики и UI с автоматическим разрешением зависимостей
- `provide<T>(ServiceClass, options?)` - регистрация сервисов
- `inject<T>(ServiceClass)` - получение инстанса сервиса
- **Service Scopes:**
  - `singleton` - один инстанс на приложение (по умолчанию)
  - `transient` - новый инстанс при каждом inject
  - `scoped` - один инстанс на поддерево компонентов
- **Lifecycle Hooks:**
  - `onInit()` - вызывается при создании сервиса
  - `onDestroy()` - вызывается при очистке
- **Автоматическое разрешение зависимостей** через constructor
- `createModule()` / `provideModule()` - модульная система
- `hasService()` - проверка наличия сервиса
- `clearAllServices()` - очистка всех сервисов
- Полная интеграция с реактивной системой
- Type-safe API
- Автоматическая очистка scoped сервисов при unmount компонентов

### 📚 Documentation
- Добавлена полная документация Context API (`docs/CONTEXT_API.md`)
- Добавлена полная документация DI System (`docs/DEPENDENCY_INJECTION.md`)
- Quick Start Guide для Context API (`docs/QUICK_START_CONTEXT.md`)
- Примеры сервисов:
  - `ThemeService` - управление темой приложения
  - `LoggerService` - система логирования с уровнями
  - `CounterService` - счетчик с зависимостями
  - `ApiService` - HTTP-клиент
- Примеры компонентов с DI:
  - Service DI Example - демонстрация всех сервисов
  - API Service Example - работа с API через DI
  - Гибридные примеры (Services + Inline логика)

### 🔧 Internal
- Интегрирована очистка контекстов в `cleanupComponentEffectsByInstanceKey`
- Интегрирована очистка scoped сервисов при unmount компонентов
- Обновлены exports в `index.ts`:
  - Context API: `provideContext`, `injectContext` (разделены с DI)
  - DI System: `provide`, `inject`, `provideModule`, `createModule`
- Добавлена поддержка Context API в jsx-runtime
- Добавлена поддержка DI System в jsx-runtime
- Новый файл `di.ts` с полной реализацией DI-контейнера

## [0.1.0] - 2025-01-XX

### ✨ Added
- **Реактивная система**
  - `state` - создание реактивных переменных (Flutter-style)
  - `setState` - batch updates для множественных изменений
  - `computed` - вычисляемые значения с поддержкой асинхронных функций
  - `effect` - side effects с семантикой React useEffect
  - `batch` - группировка обновлений
  - `untrack` - выполнение кода без отслеживания зависимостей

- **JSX Runtime**
  - Поддержка функциональных компонентов
  - Fragment support
  - Key prop для оптимизации
  - Реактивные атрибуты
  - Event handlers

- **Router**
  - History mode (без `#`)
  - Hash mode
  - Route parameters
  - Query strings
  - Route guards (`beforeEach`, `afterEach`, `beforeEnter`)
  - Programmatic navigation

- **Performance Utilities**
  - `memo` - мемоизация компонентов
  - `lazy` - ленивая загрузка компонентов
  - `VirtualList` - виртуализация списков
  - `debounce` / `throttle` - оптимизация обработчиков
  - `useIntersectionObserver` - отслеживание видимости элементов
  - `measurePerformance` - замеры производительности

- **DevTools**
  - Отслеживание signals
  - Отслеживание effects
  - Статистика производительности

- **TypeScript Support**
  - Полная типизация API
  - Type inference для компонентов и props
  - Strict mode compatible

### 🐛 Fixed
- Исправлены утечки памяти в effects
- Исправлена работа effects с зависимостями после навигации
- Исправлено дублирование event listeners
- Исправлена очистка state при unmount компонентов
- Исправлена работа асинхронных computed values
- Исправлено восстановление effects после re-render

### 📚 Documentation
- README.md с основной информацией
- Примеры использования
- API reference
- ROADMAP для дальнейшего развития

### 🔧 Build
- TypeScript configuration
- Vite configuration
- ESM build
- Source maps
- Type declarations

---

## Формат версий

Мы следуем [Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0) - breaking changes
- **MINOR** (0.X.0) - новые функции, обратно совместимые
- **PATCH** (0.0.X) - bug fixes, обратно совместимые

## Типы изменений

- `✨ Added` - новые функции
- `🔧 Changed` - изменения в существующем функционале
- `🗑️ Deprecated` - функции, которые скоро будут удалены
- `🚫 Removed` - удаленные функции
- `🐛 Fixed` - исправления ошибок
- `🔒 Security` - исправления безопасности
- `📚 Documentation` - изменения в документации
- `⚡ Performance` - улучшения производительности

