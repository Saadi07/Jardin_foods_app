package com.jardinapp;

import android.provider.Settings;
import android.widget.Toast;

import androidx.annotation.NonNull;

//New Import
import android.app.Activity; 
import android.content.Context;
import android.content.Intent;
import android.net.Uri;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.IOException;
import java.io.FileNotFoundException;

public class CustomModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    CustomModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @ReactMethod
    public void show() {
		Intent intent = new Intent();
		intent.setClassName("com.honeywell.doprint", "com.honeywell.doprint.DOPrintMainActivity");
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
		reactContext.startActivity(intent);
        Toast.makeText(reactContext, "Hi from Android", Toast.LENGTH_LONG).show();
    }
    
    @NonNull
    @Override
    public String getName() {
        return "ABC";
    }
}