(function () {
    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play-button]');
        var status = shell.querySelector('[data-player-status]');
        var source = shell.getAttribute('data-video-src');
        var initialized = false;
        var hls = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function initialize() {
            if (initialized || !video || !source) {
                return Promise.resolve();
            }

            initialized = true;
            setStatus('正在初始化播放源');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                setStatus('已绑定原生 HLS 播放源');
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('HLS 播放源已就绪');
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放源加载失败，请稍后重试');
                        try {
                            hls.destroy();
                        } catch (error) {
                            console.warn(error);
                        }
                    }
                });

                return Promise.resolve();
            }

            video.src = source;
            setStatus('浏览器将尝试直接播放 m3u8');
            return Promise.resolve();
        }

        function play() {
            initialize().then(function () {
                if (button) {
                    button.classList.add('is-hidden');
                }

                var promise = video.play();

                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        setStatus('请再次点击播放按钮');
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
                setStatus('正在播放');
            });

            video.addEventListener('pause', function () {
                setStatus('已暂停');
            });

            video.addEventListener('ended', function () {
                setStatus('播放结束');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-shell[data-video-src]').forEach(setupPlayer);
})();
