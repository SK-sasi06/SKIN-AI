import glob

def clean(fp):
    with open(fp, 'rb') as f:
        data = f.read()
    # Replace backslashes
    clean_data = data.replace(b'\\', b'')
    with open(fp, 'wb') as f:
        f.write(clean_data)
    print('Cleaned:', fp)

for file in glob.glob('src/**/*.jsx', recursive=True):
    clean(file)
