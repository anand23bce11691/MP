# 🎓 Member 1 (System Architect & Team Lead) — Viva Study Guide & Defense Master Pack

**Student Name:** Anand Singh  
**Assigned Role:** System Architect & Team Lead  
**Monitored System:** IncidentIQ Observability Platform (`http://localhost:5000`) & ShopEasy Target App (`http://localhost:5001`)  

---

## ⏱️ Part 1: How to Explain the Entire Project (2-Minute Script)

When the evaluator asks: *"Anand, explain what your project is about and what problem it solves."*

### 🎙️ Exact Speech Script:
> *"Good morning/afternoon Ma'am. I am **Anand Singh**, Team Lead and System Architect for Group 1.*
> 
> *Our project is **IncidentIQ** — an Autonomous AI Observability Platform and Root-Cause Analysis Engine, paired with **ShopEasy E-Commerce Core** as our target monitored application.*
> 
> ### 🛑 The Problem:
> *In modern cloud environments, microservices generate millions of logs and metric data points every second. When a production failure occurs — such as a database connection pool lock or high CPU spike — SRE engineers waste hours manually scrolling through server logs across multiple machines to find out why the site crashed.*
> 
> ### 💡 Our Solution & Decoupled Architecture:
> *We built a decoupled, two-application system:*
> 1. **ShopEasy Target Application (`http://localhost:5001`)**: A standalone React e-commerce app handling real customer actions like browsing products, adding items to cart, and placing orders in Indian Rupees (`₹`).
> 2. **IncidentIQ Observability Control Plane (`http://localhost:5000`)**: An independent ASP.NET Core 8 Web API and React SRE dashboard.
> 
> ### ⚙️ System Workflow:
> *Whenever a user interacts with ShopEasy on Port 5001, its telemetry handler sends cross-origin HTTP POST requests to IncidentIQ on Port 5000 using an API Key.*
> *IncidentIQ's **TelemetryCollectorMiddleware** logs request duration and SQL execution time. When an anomaly occurs, our system uses **W3C Distributed Tracing** to map microservice dependencies and passes telemetry data to **Google Gemini AI** to automatically generate a structured Evidence Chain with 96% Confidence and execute 1-click self-healing playbooks."*

---

## 💻 Part 2: Line-by-Line Code File Explanations

### 📄 File 1: `src/IncidentIQ.WebApi/Program.cs` (102 Lines)

| Line Range | Code Snippet | Technical Explanation |
| :--- | :--- | :--- |
| **L1–L10** | `using IncidentIQ.Application.Engine; ...` | Namespace imports for Application engines, Infrastructure database services, and SignalR hubs. |
| **L11** | `var builder = WebApplication.CreateBuilder(args);` | Initializes ASP.NET Core host builder, loading configuration settings from `appsettings.json`. |
| **L14** | `builder.Services.AddSingleton<EfQueryInterceptor>();` | Registers `EfQueryInterceptor` as a **Singleton** so SQL timing statistics persist across HTTP requests. |
| **L16–L24** | `builder.Services.AddDbContext<AppDbContext>(...);` | Registers Entity Framework Core `AppDbContext` with **Scoped** lifetime. Injects `EfQueryInterceptor` and configures SQL Server connection string with `EnableRetryOnFailure()`. |
| **L26–L35** | `builder.Services.AddCors(options => { ... });` | Configures Cross-Origin Resource Sharing (CORS) with policy `"AllowAll"` so the standalone ShopEasy app on **Port 5001** can send HTTP telemetry requests to **Port 5000**. |
| **L38** | `AddHttpClient<IGeminiAiAdvisorService, GeminiAiAdvisorService>();` | Registers `HttpClient` for Google Gemini AI Service using the **Typed Client** pattern. |
| **L39–L42** | `AddSingleton<IFailureSimulationManager, ...>();` | Registers Chaos Laboratory, Traffic Simulator, Anomaly Detection, and Root Cause Analysis engines as **Singletons** to maintain state in memory. |
| **L45–L46** | `builder.Services.AddHostedService<SystemMetricsWorker>();` | Registers background workers implementing `IHostedService` to run asynchronously in the background. |
| **L49–L51** | `builder.Services.AddSignalR(); ... AddJsonOptions(...);` | Enables real-time SignalR WebSockets and configures JSON serializer to output Enums as readable strings instead of numbers. |
| **L53–L63** | `builder.Services.AddEndpointsApiExplorer(); AddSwaggerGen(...);` | Configures OpenAPI Swagger document generator for interactive API documentation. |
| **L65** | `var app = builder.Build();` | Compiles the service container and builds the `WebApplication` pipeline instance. |
| **L68–L73** | `app.UseSwagger(); app.UseSwaggerUI(...);` | Enables Swagger middleware UI accessible at `/swagger`. |
| **L76–L87** | `using (var scope = app.Services.CreateScope()) { ... }` | Creates a temporary DI scope to resolve `AppDbContext` and call `DbInitializer.Initialize(db)` to create missing database tables and seed initial data. |
| **L90–L92** | `app.UseDefaultFiles(); app.UseStaticFiles(); app.UseRouting();` | Configures static file hosting (serving minified React bundle from `wwwroot`) and enables ASP.NET Core URL routing. |
| **L94** | `app.UseCors("AllowAll");` | **Crucial**: Applies CORS policy *after* `UseRouting()` so preflight `OPTIONS` requests from Port 5001 pass headers. |
| **L96** | `app.UseMiddleware<TelemetryCollectorMiddleware>();` | Injects custom middleware into the pipeline to intercept every incoming HTTP request and record response latency. |
| **L98–L101** | `app.MapControllers(); app.MapHub<TelemetryHub>(...); app.Run();` | Maps API controllers, SignalR hub endpoints, and starts listening for HTTP traffic on Port 5000. |

---

### 📄 File 2: `src/IncidentIQ.Infrastructure/Services/TelemetryCollectorMiddleware.cs` (116 Lines)

| Line Range | Code Snippet | Technical Explanation |
| :--- | :--- | :--- |
| **L9–L18** | `public class TelemetryCollectorMiddleware` | Constructor accepts `RequestDelegate _next` representing the next middleware in the ASP.NET Core pipeline. |
| **L12–L13** | `private static readonly List<ApplicationLog> _recentLogs; private static readonly object _lock;` | Thread-safe static log buffer holding up to 500 recent logs in memory for fast UI rendering. |
| **L20–L26** | `public static List<ApplicationLog> GetRecentLogs()` | Thread-safe accessor method using `lock (_lock)` to safely clone recent logs ordered by timestamp. |
| **L42–L53** | `public async Task InvokeAsync(HttpContext context, ...)` | Main middleware execution method called on every HTTP request. Starts a `Stopwatch` timer. |
| **L49–L53** | `if (method == "OPTIONS" || path.StartsWith("/assets") ...)` | Bypasses logging for static files (.js, .css, images) and CORS OPTIONS preflight to avoid cluttering the telemetry console. |
| **L55–L70** | `if (state.IsApiFailureActive && path.Contains("/api/payments") ...)` | **Chaos Injection**: If simulated payment failure is active, intercepts request and returns HTTP 500 Internal Server Error artificially. |
| **L73–L90** | `try { await _next(context); } ... finally { ... }` | Calls `await _next(context)` to execute downstream controllers, catches exceptions, stops stopwatch, extracts SQL latency from `EfQueryInterceptor`, and calls `RecordLog()`. |
| **L93–L114** | `public static void RecordLog(...)` | Thread-safe method adding a new `ApplicationLog` entry to `_recentLogs` and purging oldest entries when log count exceeds 500. |

---

### 📄 File 3: `frontend/src/components/ConnectedApplicationsCard.tsx` (349 Lines)

| Line Range | Code Snippet | Technical Explanation |
| :--- | :--- | :--- |
| **L5–L13** | `interface MonitoredAppItem { ... }` | TypeScript interface defining the shape of a monitored application object (id, name, baseUrl, apiKey, endpoints). |
| **L15–L27** | `export const ConnectedApplicationsCard: React.FC = () =>` | Main React functional component setting up state hooks (`apps`, `isModalOpen`, `appName`, `baseUrl`, `apiKey`). |
| **L29–L63** | `const fetchConnectedApps = async () => { ... }` | Asynchronously fetches registered applications from `/api/telemetry/apps`. If backend is offline, falls back to ShopEasy App (`http://localhost:5001`). |
| **L65–L67** | `useEffect(() => { fetchConnectedApps(); }, []);` | React lifecycle hook running once when component mounts to load connected application data. |
| **L69–L119** | `const handleRegisterApp = async (e) => { ... }` | Handles modal form submission, POSTing new app configuration to `/api/telemetry/apps/register` and triggering a toast notification. |
| **L121–L236** | `return ( ... )` | Renders UI card displaying connected target app details: Base URL (`http://localhost:5001`), Internal API Key, status indicator, and registered API probes. |
| **L238–L345** | `{isModalOpen && ( ... )}` | Conditional JSX modal dialog providing input fields to connect additional web apps using internal API keys. |

---

### 📄 File 4: `frontend/vite.config.ts` (13 Lines)

| Line Range | Code Snippet | Technical Explanation |
| :--- | :--- | :--- |
| **L1–L4** | `import { defineConfig } from 'vite' ...` | Imports Vite configuration builder, React plugin, and Tailwind CSS v4 plugin. |
| **L6–L12** | `export default defineConfig({ ... })` | Exports Vite config object registering React and Tailwind plugins. |
| **L9** | `outDir: path.resolve(import.meta.dirname, '../src/IncidentIQ.WebApi/wwwroot')` | **Crucial Architecture Line**: Directs Vite build output directly into ASP.NET Core's `wwwroot` directory. |
| **L10** | `emptyOutDir: true` | Clears old assets in `wwwroot` before generating new bundle during build. |

---

## ❓ Part 3: 25 High-Frequency Viva Questions & Answers

### ⚙️ Category 1: System Architecture & Project Design
1. **Q: Why did you choose ASP.NET Core 8 Web API for the backend?**  
   *A: ASP.NET Core 8 offers high-performance asynchronous processing, native dependency injection, cross-platform execution, and robust Entity Framework Core integration for telemetry processing.*

2. **Q: How does single-port hosting work in your project?**  
   *A: Vite compiles our React SPA into `src/IncidentIQ.WebApi/wwwroot`. ASP.NET Core serves these static files via `app.UseStaticFiles()` on Port 5000, while handling API routes under `/api/*` in the same web engine.*

3. **Q: Why did you decouple ShopEasy on Port 5001 from IncidentIQ on Port 5000?**  
   *A: A real observability platform must run independently of the target application it monitors. If ShopEasy crashes or suffers a database lock, IncidentIQ remains operational to detect the outage, run AI analysis, and trigger remediation.*

4. **Q: How does telemetry flow from ShopEasy (Port 5001) into IncidentIQ (Port 5000)?**  
   *A: ShopEasy's context handler sends cross-origin HTTP POST requests containing route path, status code, latency, and trace ID to `http://localhost:5000/api/telemetry/ingest` with an internal API key.*

---

### 🔧 Category 2: `Program.cs` Deep-Dive Questions
5. **Q: What is `WebApplication.CreateBuilder(args)` on Line 11?**  
   *A: It initializes the host builder, loading `appsettings.json`, environment variables, logging providers, and setting up the Dependency Injection (DI) `IServiceCollection` container.*

6. **Q: What is the difference between `AddSingleton`, `AddScoped`, and `AddTransient` in Line 14 vs Line 16?**  
   *A: `AddSingleton` creates 1 instance for the entire application lifetime. `AddScoped` creates 1 instance per HTTP request (used for EF Core `AppDbContext`). `AddTransient` creates a new instance every time it is requested.*

7. **Q: Why is `EfQueryInterceptor` registered as a Singleton on Line 14?**  
   *A: Because it collects query execution times across multiple HTTP requests to calculate rolling average SQL latency for system metrics.*

8. **Q: Why did you configure CORS with `AllowAll` on Line 31?**  
   *A: To allow cross-origin requests from the standalone ShopEasy app running on a different port (`http://localhost:5001`) during development and demonstration.*

9. **Q: What happens if `app.UseCors()` is placed BEFORE `app.UseRouting()`?**  
   *A: If placed before `UseRouting()`, ASP.NET Core cannot inspect endpoint route metadata, causing cross-origin preflight `OPTIONS` requests from ShopEasy to be rejected.*

10. **Q: What does `using (var scope = app.Services.CreateScope())` do on Line 76?**  
    *A: Since `AppDbContext` is a Scoped service, it cannot be resolved directly from the root provider at startup. Creating a custom scope allows us to resolve `AppDbContext` safely and execute `DbInitializer.Initialize(db)`.*

11. **Q: What is the purpose of `app.UseDefaultFiles()` on Line 90?**  
    *A: It enables default file mapping so when users navigate to `http://localhost:5000/`, ASP.NET Core automatically serves `index.html` from `wwwroot`.*

---

### ⏱️ Category 3: `TelemetryCollectorMiddleware.cs` Deep-Dive Questions
12. **Q: What is `RequestDelegate _next` on Line 11?**  
    *A: `RequestDelegate` is a function delegate processing an HTTP context. `_next` points to the next middleware component in the ASP.NET Core HTTP execution pipeline.*

13. **Q: Why did you use `lock (_lock)` on Line 22 and Line 95?**  
    *A: Multiple HTTP requests execute concurrently on multi-threaded worker threads. `lock (_lock)` ensures thread-safe read and write operations on the shared static `_recentLogs` list to prevent race conditions.*

14. **Q: Why do you skip static assets and `OPTIONS` requests on Line 49?**  
    *A: `OPTIONS` are browser preflight checks and `.js`/`.css` are static bundle files. Skipping them prevents spamming the telemetry log console with noise, ensuring only real application API calls are monitored.*

15. **Q: How does `Stopwatch.StartNew()` work on Line 44?**  
    *A: It starts a high-resolution timer based on system CPU tick frequency to accurately measure HTTP request duration in milliseconds.*

16. **Q: What happens in the `finally` block on Line 83?**  
    *A: The `finally` block guarantees that `sw.Stop()` and `RecordLog()` execute even if an unhandled exception occurs in downstream controllers during request processing.*

17. **Q: Why do you remove the oldest log item when count exceeds 500 on Line 109?**  
    *A: To implement a sliding window memory buffer, preventing unbounded memory growth in the server process.*

---

### 🎨 Category 4: `ConnectedApplicationsCard.tsx` & React Questions
18. **Q: What is `React.FC` on Line 15?**  
    *A: `React.FC` (Functional Component) is a TypeScript generic interface that provides type checking for React props and component return JSX.*

19. **Q: What does `useTelemetry()` do on Line 16?**  
    *A: It is a custom React Context hook that grants access to global telemetry state, including the `showToast` notification system.*

20. **Q: Why do you use `try...catch` with fallback data in `fetchConnectedApps()` on Line 43?**  
    *A: It ensures resiliency. If the backend API endpoint is momentarily unreachable, the UI gracefully renders a default representation of ShopEasy App on Port 5001 without crashing.*

21. **Q: What does `useEffect` with an empty dependency array `[]` on Line 65 mean?**  
    *A: It tells React to run the `fetchConnectedApps()` side-effect function exactly once when the component mounts into the DOM.*

22. **Q: What does `e.preventDefault()` on Line 70 do?**  
    *A: It prevents the standard HTML form submission behavior, which would cause a full browser page reload.*

23. **Q: What is `target="_blank" rel="noreferrer"` on Line 177–179?**  
    *A: `target="_blank"` opens ShopEasy in a new browser tab. `rel="noreferrer"` prevents security vulnerabilities like reverse tabnabbing.*

---

### 🛠️ Category 5: `vite.config.ts` Questions
24. **Q: What is `outDir` in `vite.config.ts` on Line 9?**  
    *A: `outDir` specifies the destination path where Vite compiles production HTML, CSS, and JS assets. We set it to `../src/IncidentIQ.WebApi/wwwroot` to integrate frontend and backend seamlessly.*

25. **Q: What does `emptyOutDir: true` do on Line 10?**  
    *A: It instructs Vite to wipe the target `wwwroot` directory clean before writing new minified build files, preventing obsolete JavaScript chunks from accumulating.*
