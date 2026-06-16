<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" style="height:100%;margin:0;padding:0;">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Portal dashboard</title>

        @viteReactRefresh
        @vite(['resources/js/app.tsx'])
    </head>
    <body style="height:100%;margin:0;padding:0;overflow:hidden;">
        <div id="root" style="height:100%;"></div>
    </body>
</html>
