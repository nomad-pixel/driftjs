# Drift Framework - Roadmap

## ✅ Что уже реализовано (v0.1.0)

- [x] Реактивная система (Signals: `state`, `computed`, `effect`)
- [x] JSX Runtime с поддержкой функциональных компонентов
- [x] Роутинг (History API, параметры, query strings)
- [x] State management (`setState` как в Flutter)
- [x] Batch updates
- [x] Component lifecycle (mount/unmount)
- [x] Performance utilities (memoization, lazy loading, virtualization)
- [x] DevTools (базовая интеграция)
- [x] TypeScript support

## 🎯 План развития до production-ready (v1.0.0)

---

## **Фаза 1: Критичные функции для реальных проектов** (Приоритет: ВЫСОКИЙ)

### 1.1 Context API / Dependency Injection ✅ ЗАВЕРШЕНО
**Зачем:** Глобальное состояние без prop drilling, DI для сервисов
```typescript
const ThemeContext = createContext({ theme: 'dark' });
provideContext(ThemeContext, theme);
const theme = injectContext(ThemeContext);
```
**Статус:** ✅ Реализовано в v0.2.0
- [x] `createContext` - создание типизированных контекстов
- [x] `provide` - предоставление значений
- [x] `injectContext` - получение значений
- [x] `createProvider` - Provider-компоненты
- [x] `hasContext` - проверка наличия
- [x] Автоматическая очистка при unmount
- [x] Полная интеграция с реактивной системой
- [x] Документация и примеры
**Время:** 1 день (быстрее оценки!)

### 1.2 Error Boundaries
**Зачем:** Отлов ошибок в компонентах, graceful degradation
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```
**Оценка:** 2-3 дня

### 1.3 Portals
**Зачем:** Модальные окна, тултипы, dropdown вне DOM-иерархии
```typescript
createPortal(<Modal />, document.body);
```
**Оценка:** 2-3 дня

### 1.4 Suspense для асинхронных компонентов
**Зачем:** Декларативные loading states, code splitting
```typescript
<Suspense fallback={<Spinner />}>
  <AsyncComponent />
</Suspense>
```
**Оценка:** 4-6 дней

### 1.5 Улучшенный роутинг
- [ ] Lazy loading routes
- [ ] Scroll restoration
- [ ] Route metadata (title, description)
- [ ] Protected routes (guards)
- [ ] Route transitions
- [ ] Breadcrumbs API
**Оценка:** 5-7 дней

### 1.6 Refs API
**Зачем:** Доступ к DOM-элементам, integration с 3rd-party libs
```typescript
const inputRef = createRef<HTMLInputElement>();
<input ref={inputRef} />
```
**Оценка:** 2-3 дня

**Итого Фаза 1:** ~20-30 дней (1-1.5 месяца)

---

## **Фаза 2: Удобство разработки** (Приоритет: ВЫСОКИЙ)

### 2.1 Data Fetching Library
**Зачем:** Стандартный способ работы с API, кэширование, retry logic
```typescript
const user = createQuery(() => fetchUser(id), {
  staleTime: 5000,
  retry: 3,
  onError: (err) => console.error(err)
});
```
**Фичи:**
- Request caching
- Request deduplication
- Optimistic updates
- Refetch on window focus
- Polling
- Pagination
**Оценка:** 7-10 дней

### 2.2 Form Management
**Зачем:** Валидация форм, error handling, submission
```typescript
const form = createForm({
  initialValues: { email: '', password: '' },
  validate: (values) => { ... },
  onSubmit: async (values) => { ... }
});
```
**Фичи:**
- Field-level validation
- Form-level validation
- Async validation
- Touched/Dirty/Error states
- Integration с validation libs (Zod, Yup)
**Оценка:** 5-7 дней

### 2.3 CLI / Scaffolding Tool
**Зачем:** Быстрое создание проектов, генерация компонентов
```bash
npx create-drift-app my-app
drift generate component Button
```
**Фичи:**
- Project templates (SPA, SSR, Static)
- Component generator
- Route generator
- Vite/Rollup integration
**Оценка:** 7-10 дней

### 2.4 DevTools Extension (Chrome/Firefox)
**Зачем:** Debugging, инспектор компонентов, time-travel
**Фичи:**
- Component tree inspector
- State inspector
- Time-travel debugging
- Performance profiler
- Network inspector для data fetching
**Оценка:** 10-14 дней

### 2.5 Testing Utilities
**Зачем:** Unit/Integration тесты для компонентов
```typescript
const { getByText, click } = render(<Button />);
click(getByText('Click me'));
expect(getByText('Clicked!')).toBeInTheDocument();
```
**Фичи:**
- Component rendering
- Event simulation
- Mock utilities
- Async testing helpers
**Оценка:** 5-7 дней

**Итого Фаза 2:** ~35-50 дней (1.5-2 месяца)

---

## **Фаза 3: Масштабирование и производительность** (Приоритет: СРЕДНИЙ)

### 3.1 SSR/SSG Support
**Зачем:** SEO, первоначальная загрузка, статические сайты
**Фичи:**
- Server-side rendering
- Hydration
- Static site generation
- Streaming SSR
- Data prefetching на сервере
**Оценка:** 14-21 день

### 3.2 Transitions & Animations API
**Зачем:** Плавные переходы, анимации состояний
```typescript
const [show, setShow] = createTransition(false, { duration: 300 });
```
**Фичи:**
- CSS transitions integration
- JavaScript animations
- Route transitions
- List transitions (enter/exit)
**Оценка:** 7-10 дней

### 3.3 Concurrent Rendering
**Зачем:** Non-blocking рендеринг, приоритизация обновлений
**Фичи:**
- Time slicing
- Priority-based updates
- startTransition API
- useDeferredValue
**Оценка:** 10-14 дней

### 3.4 Advanced Performance Optimizations
- [ ] Automatic batching improvements
- [ ] Dead code elimination
- [ ] Tree shaking optimizations
- [ ] Bundle splitting strategies
- [ ] Streaming rendering
**Оценка:** 7-10 дней

**Итого Фаза 3:** ~40-55 дней (2-2.5 месяца)

---

## **Фаза 4: Экосистема и удобство** (Приоритет: СРЕДНИЙ)

### 4.1 Internationalization (i18n)
```typescript
const t = useTranslation();
<p>{t('hello', { name: 'World' })}</p>
```
**Оценка:** 5-7 дней

### 4.2 CSS-in-JS / Styled Components
```typescript
const Button = styled.button`
  background: ${props => props.primary ? 'blue' : 'gray'};
`;
```
**Оценка:** 7-10 дней

### 4.3 Accessibility Utilities
- [ ] Focus management
- [ ] ARIA helpers
- [ ] Keyboard navigation
- [ ] Screen reader announcements
**Оценка:** 5-7 дней

### 4.4 Meta Management (SEO)
```typescript
<Meta title="Page Title" description="..." />
```
**Оценка:** 3-5 дней

### 4.5 File-based Routing (опционально)
**Зачем:** Convention over configuration
```
pages/
  index.tsx        -> /
  about.tsx        -> /about
  blog/[id].tsx    -> /blog/:id
```
**Оценка:** 7-10 дней

**Итого Фаза 4:** ~27-39 дней (1-1.5 месяца)

---

## **Фаза 5: Документация и сообщество** (Приоритет: ВЫСОКИЙ)

### 5.1 Документация
- [ ] Official website (docs.driftjs.dev)
- [ ] Getting started guide
- [ ] API reference
- [ ] Core concepts
- [ ] Migration guides
- [ ] Best practices
**Оценка:** 14-21 день

### 5.2 Examples & Templates
- [ ] Todo App
- [ ] E-commerce
- [ ] Dashboard
- [ ] Blog
- [ ] Social network
- [ ] Real-time chat
**Оценка:** 10-14 дней

### 5.3 Playground
- [ ] Online REPL (как codesandbox)
- [ ] Interactive tutorials
**Оценка:** 7-10 дней

### 5.4 Community
- [ ] Discord server
- [ ] GitHub discussions
- [ ] Contributing guide
- [ ] Code of conduct
**Оценка:** 3-5 дней

**Итого Фаза 5:** ~34-50 дней (1.5-2 месяца)

---

## 📦 Дополнительные библиотеки (опционально)

### Drift Ecosystem Packages

1. **@drift/router** (уже есть в runtime, выделить отдельно)
2. **@drift/query** - Data fetching & caching
3. **@drift/forms** - Form management
4. **@drift/motion** - Animations
5. **@drift/styled** - CSS-in-JS
6. **@drift/i18n** - Internationalization
7. **@drift/test** - Testing utilities
8. **@drift/ssr** - Server-side rendering
9. **@drift/meta** - Meta tags management
10. **@drift/a11y** - Accessibility helpers

---

## 🚀 Сводный план по срокам

| Фаза | Приоритет | Срок | Результат |
|------|-----------|------|-----------|
| **Фаза 1** | ⭐⭐⭐ КРИТИЧНО | 1-1.5 месяца | **v0.5.0** - Можно делать средние проекты |
| **Фаза 2** | ⭐⭐⭐ КРИТИЧНО | 1.5-2 месяца | **v0.8.0** - DX на уровне конкурентов |
| **Фаза 3** | ⭐⭐ ВАЖНО | 2-2.5 месяца | **v0.9.0** - Production-ready для крупных проектов |
| **Фаза 4** | ⭐⭐ ВАЖНО | 1-1.5 месяца | **v0.95.0** - Полноценная экосистема |
| **Фаза 5** | ⭐⭐⭐ КРИТИЧНО | 1.5-2 месяца | **v1.0.0** - Public release |

**Общий срок до v1.0.0:** ~7-9 месяцев

---

## 🎯 Минимально необходимое для v1.0.0 (MVP)

Если сократить план до минимума:

### Обязательные функции:
1. ✅ Context API (Фаза 1.1)
2. ✅ Error Boundaries (Фаза 1.2)
3. ✅ Portals (Фаза 1.3)
4. ✅ Suspense (Фаза 1.4)
5. ✅ Улучшенный роутинг (Фаза 1.5)
6. ✅ Refs API (Фаза 1.6)
7. ✅ Data Fetching (Фаза 2.1)
8. ✅ Form Management (Фаза 2.2)
9. ✅ CLI Tool (Фаза 2.3)
10. ✅ Testing Utilities (Фаза 2.5)
11. ✅ Документация (Фаза 5.1)
12. ✅ Examples (Фаза 5.2)

**MVP срок:** ~4-5 месяцев

---

## 📈 Метрики успеха

### Технические метрики:
- Bundle size < 10KB (gzipped)
- Time to Interactive < 2s
- Lighthouse score > 90
- 100% TypeScript coverage
- Test coverage > 80%

### Бизнес метрики:
- 1000+ GitHub stars
- 10+ contributors
- 100+ production apps
- Active community (Discord/Discussions)

---

## 🤔 Рекомендации по приоритетам

### Для немедленного старта (следующие 2 недели):
1. **Context API** - без него сложно делать даже средние приложения
2. **Refs API** - нужен для интеграций с библиотеками
3. **Error Boundaries** - критично для production

### Для работы с реальными проектами (месяц 1-2):
4. **Suspense** - modern подход к loading states
5. **Улучшенный роутинг** - lazy loading routes обязателен
6. **Data Fetching** - каждое приложение делает API calls
7. **Form Management** - формы везде

### Для масштабирования (месяц 3-4):
8. **CLI Tool** - упрощает onboarding
9. **Testing Utilities** - для enterprise adoption
10. **DevTools** - критично для debugging
11. **Документация** - без нее фреймворк не взлетит

---

## 🔧 Следующий шаг

**Рекомендую начать с:**

### Неделя 1-2: Context API + Refs + Error Boundaries
Эти три функции дадут максимальную пользу при минимальных затратах.

**Хотите, чтобы я начал реализацию Context API?** Это самая востребованная функция для реальных приложений.

