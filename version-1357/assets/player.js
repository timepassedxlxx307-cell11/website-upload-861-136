(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".js-play-button");
            var videoUrl = player.getAttribute("data-video");
            var hls = null;
            var attached = false;

            if (!video || !button || !videoUrl) {
                return;
            }

            function attachVideo() {
                if (attached) {
                    return;
                }

                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        maxBufferLength: 30,
                        capLevelToPlayerSize: true
                    });
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    return;
                }

                video.src = videoUrl;
            }

            function begin() {
                attachVideo();
                video.controls = true;
                button.classList.add("is-hidden");

                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            button.addEventListener("click", begin);

            video.addEventListener("click", function () {
                if (video.paused && !video.controls) {
                    begin();
                }
            });

            window.addEventListener("pagehide", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    });
})();
