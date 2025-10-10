#!/usr/bin/env python3
"""
spectrogram_inspect.py
Generates spectrogram PNGs at different STFT window sizes to reveal hidden images/text.
Usage:
    python spectrogram_inspect.py secret.wav
"""

import sys
import numpy as np
import matplotlib.pyplot as plt
from scipy.io import wavfile
from scipy import signal

def make_and_save_spectrogram(wav_path, nperseg=1024, noverlap=None, cmap='viridis', outname=None):
    sr, data = wavfile.read(wav_path)
    if data.ndim > 1:
        data = data.mean(axis=1)  # mix to mono
    if noverlap is None:
        noverlap = nperseg // 2
    f, t, Sxx = signal.spectrogram(data, sr, window='hann', nperseg=nperseg, noverlap=noverlap, mode='magnitude')
    S_db = 20 * np.log10(Sxx + 1e-10)
    if outname is None:
        outname = f"spect_{nperseg}.png"
    plt.figure(figsize=(12,6))
    plt.imshow(np.flipud(S_db), aspect='auto', extent=[t.min(), t.max(), f.min(), f.max()])
    plt.xlabel('Time (s)')
    plt.ylabel('Frequency (Hz)')
    plt.title(f"Spectrogram nperseg={nperseg}")
    plt.tight_layout()
    plt.axis('off')  # turn off axes for a clearer image
    plt.savefig(outname, dpi=200, bbox_inches='tight', pad_inches=0)
    plt.close()
    print("Saved", outname)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python spectrogram_inspect.py file.wav")
        sys.exit(1)
    wav = sys.argv[1]
    # try several window sizes (smaller windows = better time, larger = better freq)
    for n in [256, 512, 1024, 2048, 4096]:
        make_and_save_spectrogram(wav, nperseg=n, outname=f"spect_{n}.png")

    print("Also try opening the PNGs in an image viewer, zoom in. If you see text, run OCR.")
