<?php
//Register assets for One
add_action('init', function () {
    $handle = 'one';
    if( file_exists(dirname(__FILE__, 3). "/build/admin-page-$handle.asset.php" ) ){
        $assets = include dirname(__FILE__, 3). "/build/admin-page-$handle.asset.php";
        $dependencies = $assets['dependencies'];
        wp_register_script(
            $handle,
            plugins_url("/build/admin-page-$handle.js", dirname(__FILE__, 2)),
            $dependencies,
            $assets['version']
        );
    }
});

//Register API Route to read and update settings.
add_action('rest_api_init', function (){
    //Register route
    register_rest_route( 'builder-action-test-plugin/v1' , '/one/', [
        //Endpoint to get settings from
        [
            'methods' => ['GET'],
            'callback' => function($request){
                return rest_ensure_response( [
                    'data' => [
                        'enabled' => false,
                    ]
                ], 200);
            },
            'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ],
        //Endpoint to update settings at
        [
            'methods' => ['POST'],
            'callback' => function($request){
                return rest_ensure_response( $request->get_params(), 200);
            },
            'permission_callback' => function(){
                return current_user_can('manage_options');
            }
        ]
    ]);
});

//Enqueue assets for One on admin page only
add_action('admin_enqueue_scripts', function ($hook) {
    if ('toplevel_page_one' != $hook) {
        return;
    }
    wp_enqueue_script('one');
});

//Register One menu page
add_action('admin_menu', function () {
    add_menu_page(
        __('One', 'builder-action-test-plugin'),
        __('One', 'builder-action-test-plugin'),
        'manage_options',
        'one',
        function () {
            //React root
            echo '<div id="one"></div>';
        }
    );
});
