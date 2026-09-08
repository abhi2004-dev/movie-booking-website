(venv) PS C:\Users\abhis\Desktop\Starpass\backend> uvicorn app.main:app --reload --port 8000
INFO:     Will watch for changes in these directories: ['C:\\Users\\abhis\\Desktop\\Starpass\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [11596] using WatchFiles
INFO:     Started server process [4608]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:55833 - "GET /movies/1368337 HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1055, in connect_check_health
    sock = self._connect()
           ^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1617, in _connect
    raise err
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1601, in _connect
    sock.connect(socket_address)
ConnectionRefusedError: [WinError 10061] No connection could be made because the target machine actively refused it

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\protocols\http\httptools_impl.py", line 422, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 88, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\routing.py", line 670, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2734, in app
    await route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1780, in handle
    await self.original_router.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2789, in handle
    await included_router._handle_selected(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1800, in _handle_selected
    await original_route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1279, in handle
    await app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 158, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 144, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 706, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 354, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1100, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\routers\movies.py", line 24, in get_movie_details_route
    data = get_movie_details(movie_id)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 44, in get_movie_details  
    return fetch_tmdb(f"/movie/{movie_id}")
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 13, in fetch_tmdb
    cached = get_cached_data(cache_key)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\cache.py", line 22, in get_cached_data   
    data = redis_client.get(key)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\commands\core.py", line 3200, in get
    return self.execute_command("GET", name, keys=[name])
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 867, in execute_command
    return self._execute_command(*args, **options)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 873, in _execute_command
    conn = self.connection or pool.get_connection()
                              ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\utils.py", line 258, in wrapper
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 3273, in get_connection
    connection.connect()
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1028, in connect
    self.retry.call_with_retry(
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 132, in call_with_retry
    raise error
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 120, in call_with_retry
    return do()
           ^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1029, in <lambda>
    lambda: self.connect_check_health(
            ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1077, in connect_check_health
    raise e
redis.exceptions.ConnectionError: Error 10061 connecting to localhost:6379. No connection could be made because the target machine actively refused it.
INFO:     127.0.0.1:54037 - "GET /movies/search HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1055, in connect_check_health
    sock = self._connect()
           ^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1617, in _connect
    raise err
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1601, in _connect
    sock.connect(socket_address)
ConnectionRefusedError: [WinError 10061] No connection could be made because the target machine actively refused it

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\protocols\http\httptools_impl.py", line 422, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 88, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\routing.py", line 670, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2734, in app
    await route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1780, in handle
    await self.original_router.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2789, in handle
    await included_router._handle_selected(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1800, in _handle_selected
    await original_route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1279, in handle
    await app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 158, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 144, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 706, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 354, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1100, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\routers\movies.py", line 18, in search_movies_route
    return search_movies(q)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 41, in search_movies      
    return fetch_tmdb("/movie/now_playing").get("results", [])
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 13, in fetch_tmdb
    cached = get_cached_data(cache_key)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\cache.py", line 22, in get_cached_data   
    data = redis_client.get(key)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\commands\core.py", line 3200, in get
    return self.execute_command("GET", name, keys=[name])
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 867, in execute_command
    return self._execute_command(*args, **options)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 873, in _execute_command
    conn = self.connection or pool.get_connection()
                              ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\utils.py", line 258, in wrapper
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 3273, in get_connection
    connection.connect()
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1028, in connect
    self.retry.call_with_retry(
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 132, in call_with_retry
    raise error
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 120, in call_with_retry
    return do()
           ^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1029, in <lambda>
    lambda: self.connect_check_health(
            ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1077, in connect_check_health
    raise e
redis.exceptions.ConnectionError: Error 10061 connecting to localhost:6379. No connection could be made because the target machine actively refused it.
INFO:     127.0.0.1:49634 - "GET /movies/969681 HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1055, in connect_check_health
    sock = self._connect()
           ^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1617, in _connect
    raise err
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1601, in _connect
    sock.connect(socket_address)
ConnectionRefusedError: [WinError 10061] No connection could be made because the target machine actively refused it

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\protocols\http\httptools_impl.py", line 422, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 63, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\applications.py", line 1163, in __call__
    await super().__call__(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\applications.py", line 96, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 88, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\routing.py", line 670, in __call__
    await self.middleware_stack(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2734, in app
    await route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1780, in handle
    await self.original_router.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 2789, in handle
    await included_router._handle_selected(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1800, in _handle_selected
    await original_route.handle(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 1279, in handle
    await app(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 158, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 144, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 706, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\fastapi\routing.py", line 354, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\starlette\concurrency.py", line 34, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\to_thread.py", line 65, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2706, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1100, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\routers\movies.py", line 24, in get_movie_details_route
    data = get_movie_details(movie_id)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 44, in get_movie_details  
    return fetch_tmdb(f"/movie/{movie_id}")
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\tmdb.py", line 13, in fetch_tmdb
    cached = get_cached_data(cache_key)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\app\services\cache.py", line 22, in get_cached_data   
    data = redis_client.get(key)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\commands\core.py", line 3200, in get
    return self.execute_command("GET", name, keys=[name])
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 867, in execute_command
    return self._execute_command(*args, **options)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\client.py", line 873, in _execute_command
    conn = self.connection or pool.get_connection()
                              ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\utils.py", line 258, in wrapper
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 3273, in get_connection
    connection.connect()
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1028, in connect
    self.retry.call_with_retry(
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 132, in call_with_retry
    raise error
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\retry.py", line 120, in call_with_retry
    return do()
           ^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1029, in <lambda>
    lambda: self.connect_check_health(
            ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\abhis\Desktop\Starpass\backend\venv\Lib\site-packages\redis\connection.py", line 1077, in connect_check_health
    raise e
redis.exceptions.ConnectionError: Error 10061 connecting to localhost:6379. No connection could be made because the target machine actively refused it.
