#include <cstdio>
#include <cstring>
#include <map>
#include <string>
FILE* fin;
FILE* fout;
std::map <std::string, int> map;
char line[10240];
char aux[10240];
int isSpace(char chr) {
	return chr == ' ' || chr == '\n' || chr == '\t';
}
int isLetter(char chr) {
	chr |= 32;
	return chr >= 'a' && chr <= 'z';
}
char* trim(char str[]) {
	char *dst = str;
	char *src = str;
	while (isSpace(*src)) {
		++ src;
	}
	while (*src) {
		*dst++ = *src++;
	}
	if (dst > str) {
		while (isSpace(dst[-1])) {
			-- dst;
		}
	}
	*dst = '\0';
	return str;
}
void replaceWord(std::string &str, std::string word, int len) {
	int pos = str.find(word);
	std::string s = "<a href=\"#" + word + "\">" + word + "</a>";
	int start = 0;
	int sublen = s.length();
	while (pos != std::string::npos) {
		if (str[pos-1] != '*' || isLetter(str[pos+len])) {
			start += len;
		} else {
			str.replace(pos - 1, len + 1, s);
			start = pos + sublen;
		}
		pos = str.find(word, start);
	}
}
void replace(char str[]) {
	std::string s = std::string(str);
	for (auto it=map.begin(), end=map.end(); it != end; ++it) {
		replaceWord(s, it->first, it->second);
	}
	strcpy(str, s.c_str());
}
int main() {
	fin = fopen("Documentacao.txt", "r");
	fout = fopen("Documentacao.html", "w");
	fprintf(fout,
		"<meta charset=\"utf-8\">\n"
		"<style type=\"text/css\">\n"
		"\tbody {\n"
		"\t\tmax-width: 800px;\n"
		"\t\tmargin: 40px auto;\n"
		"\t\tfont-size: 20px;\n"
		"\t\tfont-family: monospace;\n"
		"\t\tbackground-color: #ddd;\n"
		"\t}\n"
		"\tp {\n"
		"\t\tmargin-left: 20px;\n"
		"\t}\n"
	"</style>\n");
	int n = 0;
	while (!feof(fin)) {
		fgets(line, sizeof(line), fin);
		trim(line);
		if (!*line) continue;
		if (!strncmp(line, "# ", 2)) {
			strcpy(aux, line + 2);
			char *p = strstr(aux, ": ");
			if (*p) {
				*p = '\0';
				map[std::string(aux)] = strlen(aux);
			}
		}
	}
	fseek(fin, 0L, SEEK_SET);
	while (!feof(fin)) {
		fgets(line, sizeof(line), fin);
		trim(line);
		if (!*line) continue;
		if (!strncmp(line, "# ", 2)) {
			strcpy(aux, line + 2);
			char *p = strstr(aux, ": ");
			if (*p) {
				if (n > 0) {
					fprintf(fout, "\t</p>\n</div>\n");
				}
				*p = '\0';
				fprintf(fout, "<div id=\"%s\">\n", aux);
				fprintf(fout, "\t<h3>%s</h3>\n\t<p>\n", aux);
				*p = ':';
				replace(p);
				fprintf(fout, "\t\t%s\n", p + 2);
				++ n;
			} else {
				replace(p);
				fprintf(fout, "\t\t%s\n", line);
			}
		} else {
			replace(line);
			fprintf(fout, "\t\t%s\n", line);
		}
	}
	if (n > 0) {
		fprintf(fout, "\t</p>\n</div>\n", line);
	}
	fprintf(fout, "<script type=\"text/javascript\">\n"
		"\tlet links = document.querySelectorAll('a');\n"
		"\tfor (let i=links.length; i--;) {\n"
		"\t\tlet link = links[i];\n"
		"\t\tlet id = link.getAttribute('href');\n"
		"\t\tlet target = document.querySelector(id);\n"
		"\t\tlink.addEventListener('mouseover', () => {\n"
		"\t\t\ttarget.style.color = '#07f';\n"
		"\t\t});\n"
		"\t\tlink.addEventListener('mouseout', () => {\n"
		"\t\t\ttarget.style.color = '#000';\n"
		"\t\t});\n"
		"\t}\n"
	"</script>");
	fclose(fin);
	fclose(fout);
}