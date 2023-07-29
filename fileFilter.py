print("About to read file.")

with open("basics.tsv.rawdata", "r", encoding="utf-8") as file:
    lines = file.readlines()

print("Finished reading file.")

with open("ratings.tsv.rawdata", "r", encoding="utf-8") as file:
    lines2 = file.readlines()

print("Finished reading file 2.")

ratingsDict = dict()
for line in lines2:
    c = line.strip().split("\t")
    ratingsDict[c[0]] = (c[1], c[2])

with open("mergedData.tsv", "w", encoding="utf-8") as file:
    for line in lines:
        c = line.split("\t")
        if line.startswith("tconst") or c[1] == "movie":
            tconst = c[0]
            title = c[1]
            prim = c[2]
            st = c[5]
            rm = c[7]
            gen = c[8].strip()
            used = [tconst, title, prim, st, rm, gen]
            if all(x != "\\N" for x in used):
                if tconst in ratingsDict:
                    file.write("\t".join([*used, *ratingsDict[tconst]]) + "\n")

print("Finished writing new file.")
