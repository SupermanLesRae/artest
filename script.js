document.getElementById('imageInput').addEventListener('change', function(e) {
    let imgElement = new Image();
    imgElement.src = URL.createObjectURL(e.target.files[0]);
    imgElement.onload = function() {
        let canvas = document.getElementById('canvasOutput');
        let ctx = canvas.getContext('2d');
        canvas.width = imgElement.width;
        canvas.height = imgElement.height;
        ctx.drawImage(imgElement, 0, 0);

        let src = cv.imread(canvas);
        let dst = new cv.Mat();
        let gray = new cv.Mat();
        let blurred = new cv.Mat();
        let edges = new cv.Mat();

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Blur to reduce noise
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Edge detection
        cv.Canny(blurred, edges, 50, 150, 3, false);

        // Find contours
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        cv.findContours(edges, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

        // Approximate contours to polygons + get bounding rects and circles
        for (let i = 0; i < contours.size(); ++i) {
            let contour = contours.get(i);
            let approx = new cv.Mat();
            cv.approxPolyDP(contour, approx, 0.02 * cv.arcLength(contour, true), true);
            if (approx.rows === 4 && cv.contourArea(approx) > 1000) {  // Assuming a minimum area for a valid square
                let color = new cv.Scalar(255, 0, 0);
                cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 0);
            }
            approx.delete();
            contour.delete();
        }

        cv.imshow('canvasOutput', src);
        src.delete();
        dst.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
    }
});
