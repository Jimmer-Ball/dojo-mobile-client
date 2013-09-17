/**
 * The DOJO build system release build profile for the whole user interface application
 */
var profile = (function () {
    /**
     * Return whether a file should be copied "as is" during the build of the package.  Here we
     * ensure the package profile and the package.json files are copied as is, as is any imagery.
     *
     * @param filename file name
     * @param mid module id
     */
    copyOnly = function (filename, mid) {
        var list = {
            "mobilehr.profile":1,
            "package.json":1
        };
        return (mid in list) || /(png|jpg|jpeg|gif|tiff)$/.test(filename);
    };
    return {
        /**
         * Set of resources within this package
         */
        resourceTags:{
            test:function (filename, mid) {
                return false;
            },
            copyOnly:function (filename, mid) {
                return copyOnly(filename, mid);
            },
            /**
             * All files within this package will be treated as AMD files unless they are copy only resources
             *
             * @param filename filename
             * @param mid module id
             */
            amd:function (filename, mid) {
                return !copyOnly(filename, mid) && /\.js$/.test(filename);
            }
        },
        trees:[
            [".", ".", /(\/\.)|(~$)/]
        ]
    };
})();
