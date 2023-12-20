const stylesheet = {
  warning: 'background: #ff0; padding: 5px; color: #000;',
  success: 'background: #3bbd79; padding: 5px; color: #fff;',
  info: 'background: blue; padding: 5px; color: white;',
  error: 'background: red; padding: 5px; color: white;',
  in: 'background: green; padding: 3px; color: white;',
  out: 'background: purple; padding: 3px; color: white;',
};

class Logger {
  prefixedLog = (style: string, prefix: string, ...data: any[]) => {
    this.styledLog('', ...[`%c${prefix}`, style, ...data]);
  };

  styledLog = (style: string, ...data: any[]) => {
    // @ts-ignore
    if (!global.__DEV__) {
      return null;
    }
    const options = [];
    data.map(item => options.push(item));

    if (style) {
      options.unshift('%c%s', style);
    }

    console.log(...options);
  };

  log = (...data: any[]) => this.styledLog('', ...data);

  warn = (...data: any[]) => this.styledLog(stylesheet.warning, ...data);

  info = (...data: any[]) => this.styledLog(stylesheet.info, ...data);

  error = (...data: any[]) => this.styledLog(stylesheet.error, ...data);

  success = (...data: any[]) => this.styledLog(stylesheet.success, ...data);

  in = (...data: any[]) => this.prefixedLog(stylesheet.in, '<--', ...data);

  out = (...data: any[]) => this.prefixedLog(stylesheet.out, '-->', ...data);
}

export const logger = new Logger();
