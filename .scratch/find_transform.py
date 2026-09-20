import cv2
import numpy as np

lab_path = r"D:\Projects\Chronicle-of-Conquest\.mapref\fantasy-world-labeled.jpg"
exp_path = r"D:\Projects\Assets\Warhammer\Warhammer-Fantasy-World-Factions-Expanded-Map.jpg"

img1 = cv2.imread(lab_path, cv2.IMREAD_GRAYSCALE)   # labeled reference (2481x1496)
img2 = cv2.imread(exp_path, cv2.IMREAD_GRAYSCALE)   # expanded factions map (1958x1523)
print("lab", img1.shape, "exp", img2.shape)

orb = cv2.ORB_create(6000)
k1, d1 = orb.detectAndCompute(img1, None)
k2, d2 = orb.detectAndCompute(img2, None)
print("keypoints", len(k1), len(k2))

bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
matches = bf.knnMatch(d1, d2, k=2)
good = []
for m, n in matches:
    if m.distance < 0.75 * n.distance:
        good.append(m)
print("good matches", len(good))

src = np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1, 1, 2)  # labeled coords
dst = np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1, 1, 2)  # expanded coords

# We want transform: expanded -> labeled
M, mask = cv2.estimateAffinePartial2D(dst, src, method=cv2.RANSAC, ransacReprojThreshold=8.0)
print("inliers", mask.sum() if mask is not None else None, "/", len(good))
print("Affine expanded->labeled:")
print(M)

np.save("affine_exp_to_lab.npy", M)
